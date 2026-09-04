import {
  healthControllerGetHealth,
  type HealthResponseDto,
} from './generated';
import { getApiClient } from './client';
import { normalizeApiResult, type ApiResult } from './errors';

export async function getHealth(): Promise<ApiResult<HealthResponseDto>> {
  const result = await healthControllerGetHealth({ client: getApiClient() });

  return normalizeApiResult<HealthResponseDto>(result);
}
