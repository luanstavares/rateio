import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthenticatedApiUser, revokeApiSession } from '../api/auth';
import { refreshSessionTokens } from './session-refresh';
import {
  ACCESS_TOKEN_COOKIE,
  ANONYMOUS_SESSION_TOKEN_COOKIE,
  anonymousSessionTokenSchema,
  clearSessionCookies,
  REFRESH_TOKEN_COOKIE,
  setSessionCookies,
  type AuthenticatedUser,
} from './session-cookies';

/**
 * Reads the access token prepared by the request proxy.
 * Expired sessions are rotated before server components or actions read it.
 */
export async function getRefreshAwareAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getAnonymousSessionToken(): Promise<string | null> {
  const token = (await cookies()).get(ANONYMOUS_SESSION_TOKEN_COOKIE)?.value;
  const parsedToken = anonymousSessionTokenSchema.safeParse(token);
  return parsedToken.success ? parsedToken.data : null;
}

export const getCurrentUser = cache(
  async (): Promise<AuthenticatedUser | null> => {
    const accessToken = await getRefreshAwareAccessToken();
    if (!accessToken) return null;

    const result = await getAuthenticatedApiUser(accessToken);
    if (result.data) return result.data;
    if (result.error?.kind === 'api' && result.error.statusCode === 401)
      return null;
    throw new Error('Sessão temporariamente indisponível. Tente novamente.');
  },
);

export async function rotateSession(): Promise<NextResponse> {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  const result = await refreshSessionTokens(refreshToken);
  if (result.kind !== 'success')
    return NextResponse.json(
      { success: false },
      {
        status: result.kind === 'invalid' ? 401 : 503,
        headers: { 'cache-control': 'no-store' },
      },
    );
  const response = NextResponse.json(
    { success: true },
    { headers: { 'cache-control': 'no-store' } },
  );
  setSessionCookies(response, result.tokens);
  return response;
}

export async function logoutSession(response: NextResponse): Promise<void> {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    const result = await revokeApiSession(refreshToken);
    if (result.error)
      throw new Error('Não foi possível encerrar a sessão. Tente novamente.');
  }
  clearSessionCookies(response);
}
