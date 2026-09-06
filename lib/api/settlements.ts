import 'server-only';

import {
  anonymousSettlementsControllerBalances,
  settlementsControllerBalances,
  type AnonymousBalanceResponseDto,
  type BalanceResponseDto,
} from './generated';
import { normalizeApiResult, type ApiResult } from './errors';
import { createServerApiClient } from './server-client';

export function listApiBalances(
  accessToken: string,
  rateioId: string,
): Promise<ApiResult<BalanceResponseDto[]>> {
  return settlementsControllerBalances({
    client: createServerApiClient(accessToken),
    path: { rateioId },
  }).then((result) => normalizeApiResult<BalanceResponseDto[]>(result));
}

export function listApiAnonymousBalances(
  sessionToken: string,
  rateioId: string,
): Promise<ApiResult<AnonymousBalanceResponseDto[]>> {
  return anonymousSettlementsControllerBalances({
    client: createServerApiClient(sessionToken),
    path: { rateioId },
  }).then((result) =>
    normalizeApiResult<AnonymousBalanceResponseDto[]>(result),
  );
}
