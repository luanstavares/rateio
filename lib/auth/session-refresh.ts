import 'server-only';
import { refreshApiSession } from '../api/auth';
import {
  authTokenResponseSchema,
  isCurrentAuthTokenResponse,
  type AuthTokenResponse,
} from './session-cookies';

export type SessionRefreshResult =
  | { kind: 'success'; tokens: AuthTokenResponse }
  | { kind: 'invalid' }
  | { kind: 'unavailable' };
export async function refreshSessionTokens(
  refreshToken: string | undefined,
): Promise<SessionRefreshResult> {
  if (!refreshToken || refreshToken.length < 20) return { kind: 'invalid' };
  try {
    const result = await refreshApiSession(refreshToken);
    if (result.error)
      return {
        kind:
          result.error.kind === 'api' &&
          [400, 401].includes(result.error.statusCode)
            ? 'invalid'
            : 'unavailable',
      };
    const parsed = authTokenResponseSchema.safeParse(result.data);
    if (
      !parsed.success ||
      !isCurrentAuthTokenResponse(parsed.data) ||
      Date.parse(parsed.data.accessExpiresAt) <= Date.now()
    )
      return { kind: 'unavailable' };
    return { kind: 'success', tokens: parsed.data };
  } catch {
    return { kind: 'unavailable' };
  }
}
