import 'server-only';

import { NextResponse } from 'next/server';
import type { ApiErrorResponseDto } from './generated';
import { getRefreshAwareAccessToken } from '../auth/server-session';
import { createServerApiClient } from './server-client';

interface ApiErrorLike {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
  details?: unknown;
}

export function apiErrorResponse(
  error: unknown,
  path: string,
): NextResponse<ApiErrorLike> {
  if (isApiError(error)) {
    return NextResponse.json(error, { status: error.statusCode });
  }

  return NextResponse.json(
    {
      statusCode: 502,
      message: 'Não foi possível comunicar com o servidor.',
      error: 'Bad Gateway',
      path,
      timestamp: new Date().toISOString(),
    },
    { status: 502 },
  );
}

export async function getAuthenticatedNotificationClient() {
  const accessToken = await getRefreshAwareAccessToken();
  if (!accessToken) return null;
  return createServerApiClient(accessToken);
}

export function unauthorizedResponse(path: string): NextResponse<ApiErrorLike> {
  return NextResponse.json(
    {
      statusCode: 401,
      message: 'Authentication required',
      error: 'Unauthorized',
      path,
      timestamp: new Date().toISOString(),
    },
    { status: 401 },
  );
}

export function isApiError(value: unknown): value is ApiErrorResponseDto {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.statusCode === 'number' &&
    (typeof candidate.message === 'string' ||
      Array.isArray(candidate.message)) &&
    typeof candidate.error === 'string' &&
    typeof candidate.path === 'string' &&
    typeof candidate.timestamp === 'string'
  );
}
