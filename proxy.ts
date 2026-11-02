import { NextRequest, NextResponse } from 'next/server';
import { refreshSessionTokens } from './lib/auth/session-refresh';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setSessionCookies,
} from './lib/auth/session-cookies';

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};

type AccessTokenPayload = {
  exp?: unknown;
  sid?: unknown;
};

function accessTokenExpiresAt(accessToken: string): number | null {
  const encodedPayload = accessToken.split('.')[1];
  if (!encodedPayload) return null;

  try {
    const decoded = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const parsed: unknown = JSON.parse(decoded);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const payload = parsed as AccessTokenPayload;
    if (typeof payload.sid !== 'string' || !payload.sid) return null;
    const expiration = payload.exp;
    return typeof expiration === 'number' && Number.isFinite(expiration)
      ? expiration * 1000
      : null;
  } catch {
    return null;
  }
}

function requestWithSessionCookies(
  request: NextRequest,
  accessToken: string,
  refreshToken: string,
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  const requestCookies = new Map(
    request.cookies.getAll().map(({ name, value }) => [name, value]),
  );
  requestCookies.set(ACCESS_TOKEN_COOKIE, accessToken);
  requestCookies.set(REFRESH_TOKEN_COOKIE, refreshToken);
  requestHeaders.set(
    'cookie',
    [...requestCookies].map(([name, value]) => `${name}=${value}`).join('; '),
  );

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export default async function proxy(
  request: NextRequest,
): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const accessTokenExpiry =
    accessToken === undefined ? null : accessTokenExpiresAt(accessToken);
  if (
    accessToken !== undefined &&
    accessTokenExpiry !== null &&
    accessTokenExpiry > Date.now() + 30_000
  ) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken === undefined) return NextResponse.next();

  const result = await refreshSessionTokens(refreshToken);
  if (result.kind === 'unavailable') {
    return NextResponse.json(
      { error: 'Session temporarily unavailable' },
      {
        status: 503,
        headers: { 'cache-control': 'no-store', 'retry-after': '5' },
      },
    );
  }
  if (result.kind === 'invalid') {
    // Failed requests cannot delete a replacement cookie set by a concurrent response.
    return requestWithSessionCookies(request, '', '');
  }
  const response = requestWithSessionCookies(
    request,
    result.tokens.accessToken,
    result.tokens.refreshToken,
  );
  setSessionCookies(response, result.tokens);
  return response;
}
