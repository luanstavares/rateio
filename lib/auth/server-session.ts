import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  getAuthenticatedApiUser,
  refreshApiSession,
  revokeApiSession,
} from '../api/auth';
import {
  ACCESS_TOKEN_COOKIE,
  authTokenResponseSchema,
  clearSessionCookies,
  isCurrentAuthTokenResponse,
  REFRESH_TOKEN_COOKIE,
  setSessionCookies,
  type AuthenticatedUser,
} from './session-cookies';

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const result = await getAuthenticatedApiUser(accessToken);
  return 'data' in result ? (result.data ?? null) : null;
});

export async function rotateSession(): Promise<NextResponse> {
  const response = NextResponse.json({ success: false }, { status: 401 });
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    clearSessionCookies(response);
    return response;
  }

  const result = await refreshApiSession(refreshToken);
  if ('error' in result) {
    clearSessionCookies(response);
    return response;
  }

  const tokens = authTokenResponseSchema.safeParse(result.data);
  if (!tokens.success || !isCurrentAuthTokenResponse(tokens.data)) {
    clearSessionCookies(response);
    return response;
  }

  const successResponse = NextResponse.json({ success: true });
  setSessionCookies(successResponse, tokens.data);
  return successResponse;
}

export async function logoutSession(response: NextResponse): Promise<void> {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) await revokeApiSession(refreshToken);
  clearSessionCookies(response);
}
