import 'server-only';

import {
  rateiosControllerCreate,
  type CreateRateioDto,
  type RateioDetailResponseDto,
} from './generated';
import { normalizeApiResult, type ApiResult } from './errors';
import { createServerApiClient } from './server-client';

export type CreateRateioInput = CreateRateioDto;

export function createApiRateio(
  accessToken: string,
  input: CreateRateioInput,
): Promise<ApiResult<RateioDetailResponseDto>> {
  return rateiosControllerCreate({
    client: createServerApiClient(accessToken),
    body: input,
  }).then((result) =>
    normalizeApiResult<RateioDetailResponseDto>(result),
  );
}
