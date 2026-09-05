import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authControllerGoogleCallback } from '../../../../../lib/api/generated';
import { createServerApiClient } from '../../../../../lib/api/server-client';
import { normalizeApiResult } from '../../../../../lib/api/errors';
import {
  authTokenResponseSchema,
  clearOAuthStateCookie,
  OAUTH_STATE_COOKIE,
  setSessionCookies,
} from '../../../../../lib/auth/session-cookies';

export const runtime = 'nodejs';

function statesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function errorRedirect(request: NextRequest): NextResponse {
  const destination = new URL('/', request.url);
  destination.searchParams.set('authError', 'oauth');
  return NextResponse.redirect(destination);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = errorRedirect(request);
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const receivedState = request.nextUrl.searchParams.get('state');
  const code = request.nextUrl.searchParams.get('code');

  clearOAuthStateCookie(response);

  if (
    !expectedState ||
    !receivedState ||
    !statesMatch(expectedState, receivedState) ||
    !code
  ) {
    return response;
  }

  const result = await authControllerGoogleCallback({
    client: createServerApiClient(),
    query: { code, state: receivedState },
  });
  const normalized = normalizeApiResult(result);
  if ('error' in normalized) return response;

  const tokens = authTokenResponseSchema.safeParse(normalized.data);
  if (!tokens.success || Date.parse(tokens.data.expiresAt) <= Date.now()) {
    return response;
  }

  const successResponse = NextResponse.redirect(new URL('/', request.url));
  clearOAuthStateCookie(successResponse);
  setSessionCookies(successResponse, tokens.data);
  return successResponse;
}
