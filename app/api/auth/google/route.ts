import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '../../../../lib/api/server-config';
import {
  OAUTH_STATE_MAX_AGE_SECONDS,
  setOAuthStateCookie,
  setOAuthReturnToCookie,
} from '../../../../lib/auth/session-cookies';

export const runtime = 'nodejs';

function safeReturnTo(request: NextRequest): string {
  const requested = request.nextUrl.searchParams.get('returnTo');
  if (!requested || !requested.startsWith('/') || requested.startsWith('//')) {
    return '/';
  }

  try {
    const destination = new URL(requested, request.nextUrl.origin);
    if (destination.origin !== request.nextUrl.origin) return '/';
    return `${destination.pathname}${destination.search}`;
  } catch {
    return '/';
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const state = randomBytes(32).toString('base64url');
  const returnTo = safeReturnTo(request);
  let authorizationUrl: URL;

  try {
    const apiUrl = new URL('/auth/google', getServerApiBaseUrl());
    apiUrl.searchParams.set('state', state);
    const upstream = await fetch(apiUrl, {
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    const location = upstream.headers.get('location');
    if (![302, 303, 307, 308].includes(upstream.status) || !location) {
      throw new Error('Google sign-in redirect is unavailable');
    }

    authorizationUrl = new URL(location);
    if (
      authorizationUrl.origin !== 'https://accounts.google.com' ||
      authorizationUrl.searchParams.get('state') !== state
    ) {
      throw new Error('Invalid Google sign-in redirect');
    }
  } catch {
    return NextResponse.json(
      { error: 'Google sign-in is temporarily unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }

  const response = NextResponse.redirect(authorizationUrl);
  setOAuthStateCookie(response, state);
  setOAuthReturnToCookie(response, returnTo);
  response.headers.set(
    'cache-control',
    `private, no-store, max-age=${OAUTH_STATE_MAX_AGE_SECONDS}`,
  );
  return response;
}
