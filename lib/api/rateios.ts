import 'server-only';

import {
  rateiosControllerChangeStatus,
  rateiosControllerCreate,
  rateiosControllerGet,
  rateiosControllerList,
  type ChangeRateioStatusDto,
  type CreateRateioDto,
  type RateioDetailResponseDto,
  type RateioListResponseDto,
  type RateioResponseDto,
  type RateiosControllerListData,
} from './generated';
import { normalizeApiResult, type ApiResult } from './errors';
import { createServerApiClient } from './server-client';

export type CreateRateioInput = CreateRateioDto;
export type ListRateiosQuery = RateiosControllerListData['query'];
export type RateioStatus = ChangeRateioStatusDto['status'];

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

export function listApiRateios(
  accessToken: string,
  query?: ListRateiosQuery,
): Promise<ApiResult<RateioListResponseDto>> {
  return rateiosControllerList({
    client: createServerApiClient(accessToken),
    query,
  }).then((result) => normalizeApiResult<RateioListResponseDto>(result));
}

export function getApiRateio(
  accessToken: string,
  id: string,
): Promise<ApiResult<RateioDetailResponseDto>> {
  return rateiosControllerGet({
    client: createServerApiClient(accessToken),
    path: { id },
  }).then((result) =>
    normalizeApiResult<RateioDetailResponseDto>(result),
  );
}

export function changeApiRateioStatus(
  accessToken: string,
  id: string,
  status: RateioStatus,
): Promise<ApiResult<RateioResponseDto>> {
  return rateiosControllerChangeStatus({
    client: createServerApiClient(accessToken),
    path: { id },
    body: { status },
  }).then((result) => normalizeApiResult<RateioResponseDto>(result));
}
