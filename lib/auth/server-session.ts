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
    return 'data' in result ? (result.data ?? null) : null;
  },
);

export async function rotateSession(): Promise<NextResponse> {
  const response = NextResponse.json({ success: false }, { status: 401 });
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    clearSessionCookies(response);
    return response;
  }

  const tokens = await refreshSessionTokens(refreshToken);
  if (!tokens) {
    clearSessionCookies(response);
    return response;
  }

  const successResponse = NextResponse.json({ success: true });
  setSessionCookies(successResponse, tokens);
  return successResponse;
}

export async function logoutSession(response: NextResponse): Promise<void> {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) await revokeApiSession(refreshToken);
  clearSessionCookies(response);
}
