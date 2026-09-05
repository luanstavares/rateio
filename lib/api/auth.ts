import 'server-only';

import {
  authControllerLogout,
  authControllerMe,
  authControllerRefresh,
  type AuthenticatedUserDto,
  type AuthTokenResponseDto,
  type SuccessResponseDto,
} from './generated';
import { createServerApiClient } from './server-client';
import { normalizeApiResult, type ApiResult } from './errors';
import {
  authenticatedUserSchema,
  authTokenResponseSchema,
  successResponseSchema,
  type AuthTokenResponse,
  type AuthenticatedUser,
} from '../auth/session-cookies';

function invalidResponse<T>(): ApiResult<T> {
  return {
    error: {
      kind: 'unexpected',
      message: 'O servidor não retornou dados válidos.',
    },
  };
}

export function refreshApiSession(
  refreshToken: string,
): Promise<ApiResult<AuthTokenResponse>> {
  return authControllerRefresh({
    client: createServerApiClient(),
    body: { refreshToken },
  }).then((result) => {
    const normalized = normalizeApiResult<AuthTokenResponseDto>(result);
    if ('error' in normalized) return normalized;
    const tokens = authTokenResponseSchema.safeParse(normalized.data);
    return tokens.success ? { data: tokens.data } : invalidResponse();
  });
}

export function revokeApiSession(
  refreshToken: string,
): Promise<ApiResult<SuccessResponseDto>> {
  return authControllerLogout({
    client: createServerApiClient(),
    body: { refreshToken },
  }).then((result) => {
    const normalized = normalizeApiResult<SuccessResponseDto>(result);
    if ('error' in normalized) return normalized;
    return successResponseSchema.safeParse(normalized.data).success
      ? normalized
      : invalidResponse();
  });
}

export function getAuthenticatedApiUser(
  accessToken: string,
): Promise<ApiResult<AuthenticatedUser>> {
  return authControllerMe({
    client: createServerApiClient(accessToken),
    cache: 'no-store',
  }).then((result) => {
    const normalized = normalizeApiResult<AuthenticatedUserDto>(result);
    if ('error' in normalized) return normalized;
    const user = authenticatedUserSchema.safeParse(normalized.data);
    return user.success ? { data: user.data } : invalidResponse();
  });
}
