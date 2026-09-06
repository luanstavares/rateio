import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/api/config';
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

export function GET(request: NextRequest): NextResponse {
  const state = randomBytes(32).toString('base64url');
  const returnTo = safeReturnTo(request);
  const apiUrl = new URL('/auth/google', getApiBaseUrl());
  apiUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(apiUrl);
  setOAuthStateCookie(response, state);
  setOAuthReturnToCookie(response, returnTo);
  response.headers.set(
    'cache-control',
    `private, no-store, max-age=${OAUTH_STATE_MAX_AGE_SECONDS}`,
  );
  return response;
}
