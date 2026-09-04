import type { ApiErrorResponseDto } from './generated';

export type ApiClientError =
  | {
      kind: 'api';
      statusCode: number;
      message: string | string[];
      error: string;
      path: string;
      timestamp: string;
      details?: unknown;
    }
  | {
      kind: 'network';
      message: string;
    }
  | {
      kind: 'unexpected';
      message: string;
    };

export type ApiResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: ApiClientError };

function isApiErrorResponse(value: unknown): value is ApiErrorResponseDto {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.statusCode === 'number' &&
    (typeof candidate.message === 'string' || Array.isArray(candidate.message)) &&
    typeof candidate.error === 'string' &&
    typeof candidate.path === 'string' &&
    typeof candidate.timestamp === 'string'
  );
}

export function normalizeApiError(
  error: unknown,
  response?: Response,
): ApiClientError {
  if (isApiErrorResponse(error)) {
    return {
      kind: 'api',
      statusCode: error.statusCode,
      message: error.message,
      error: error.error,
      path: error.path,
      timestamp: error.timestamp,
      ...(error.details === undefined ? {} : { details: error.details }),
    };
  }

  if (response === undefined && error instanceof TypeError) {
    return {
      kind: 'network',
      message: 'Não foi possível conectar ao servidor.',
    };
  }

  return {
    kind: 'unexpected',
    message: 'Ocorreu um erro inesperado ao comunicar com o servidor.',
  };
}

export function normalizeApiResult<T>(result: {
  data?: T;
  error?: unknown;
  response?: Response;
}): ApiResult<T> {
  if (result.error !== undefined) {
    return { error: normalizeApiError(result.error, result.response) };
  }

  if (result.data === undefined) {
    return {
      error: {
        kind: 'unexpected',
        message: 'O servidor não retornou dados válidos.',
      },
    };
  }

  return { data: result.data };
}
