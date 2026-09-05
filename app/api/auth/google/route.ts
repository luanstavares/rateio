import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/api/config';
import {
  OAUTH_STATE_MAX_AGE_SECONDS,
  setOAuthStateCookie,
} from '../../../../lib/auth/session-cookies';

export const runtime = 'nodejs';

export function GET(): NextResponse {
  const state = randomBytes(32).toString('base64url');
  const apiUrl = new URL('/auth/google', getApiBaseUrl());
  apiUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(apiUrl);
  setOAuthStateCookie(response, state);
  response.headers.set(
    'cache-control',
    `private, no-store, max-age=${OAUTH_STATE_MAX_AGE_SECONDS}`,
  );
  return response;
}
