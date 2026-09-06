import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authControllerGoogleCallback } from '../../../../../lib/api/generated';
import { createServerApiClient } from '../../../../../lib/api/server-client';
import { normalizeApiResult } from '../../../../../lib/api/errors';
import { claimApiAnonymousParticipant } from '../../../../../lib/api/rateios';
import {
  anonymousSessionTokenSchema,
  authTokenResponseSchema,
  clearAnonymousSessionCookie,
  clearOAuthStateCookie,
  clearOAuthReturnToCookie,
  ANONYMOUS_SESSION_TOKEN_COOKIE,
  OAUTH_RETURN_TO_COOKIE,
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

function safeReturnTo(request: NextRequest): string {
  const returnTo = request.cookies.get(OAUTH_RETURN_TO_COOKIE)?.value;
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return '/';
  }

  try {
    const destination = new URL(returnTo, request.nextUrl.origin);
    if (destination.origin !== request.nextUrl.origin) return '/';
    return `${destination.pathname}${destination.search}`;
  } catch {
    return '/';
  }
}

function errorRedirect(request: NextRequest, returnTo: string): NextResponse {
  const destination = new URL(returnTo, request.url);
  destination.searchParams.set('authError', 'oauth');
  return NextResponse.redirect(destination);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const returnTo = safeReturnTo(request);
  const response = errorRedirect(request, returnTo);
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const receivedState = request.nextUrl.searchParams.get('state');
  const code = request.nextUrl.searchParams.get('code');

  clearOAuthStateCookie(response);
  clearOAuthReturnToCookie(response);

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

  const anonymousTokenValue = request.cookies.get(
    ANONYMOUS_SESSION_TOKEN_COOKIE,
  )?.value;
  const anonymousToken =
    anonymousSessionTokenSchema.safeParse(anonymousTokenValue);
  let claimSucceeded = false;

  if (anonymousToken.success) {
    try {
      const claimResult = await claimApiAnonymousParticipant(
        tokens.data.accessToken,
        {
          token: anonymousToken.data,
        },
      );
      claimSucceeded = claimResult.error === undefined;
    } catch {
      claimSucceeded = false;
    }
  }

  const destination = new URL(returnTo, request.url);
  if (anonymousTokenValue !== undefined) {
    destination.searchParams.set('claim', claimSucceeded ? 'success' : 'error');
  }

  const successResponse = NextResponse.redirect(destination);
  clearOAuthStateCookie(successResponse);
  clearOAuthReturnToCookie(successResponse);
  setSessionCookies(successResponse, tokens.data);
  if (claimSucceeded) clearAnonymousSessionCookie(successResponse);
  return successResponse;
}
