import 'server-only';

import { refreshApiSession } from '../api/auth';
import {
  authTokenResponseSchema,
  isCurrentAuthTokenResponse,
  type AuthTokenResponse,
} from './session-cookies';

const refreshTokenSchema = /^.{20,}$/;

/**
 * Exchanges a refresh token exactly once and accepts only a live token pair.
 * Callers decide how the returned pair is written to the cookie boundary.
 */
export async function refreshSessionTokens(
  refreshToken: string | undefined,
): Promise<AuthTokenResponse | null> {
  if (refreshToken === undefined || !refreshTokenSchema.test(refreshToken)) {
    return null;
  }

  try {
    const result = await refreshApiSession(refreshToken);
    if ('error' in result) return null;

    const tokens = authTokenResponseSchema.safeParse(result.data);
    return tokens.success && isCurrentAuthTokenResponse(tokens.data)
      ? tokens.data
      : null;
  } catch {
    return null;
  }
}
