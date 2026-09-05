'use server';

import { z } from 'zod';
import {
  createApiRateio,
  type CreateRateioInput,
} from '../../lib/api/rateios';
import type { RateioDetailResponseDto } from '../../lib/api/generated';
import type { ApiClientError } from '../../lib/api/errors';
import { getAccessToken } from '../../lib/auth/server-session';

const createRateioSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  baseCurrency: z
    .string()
    .trim()
    .regex(/^[a-zA-Z]{3}$/)
    .transform((value) => value.toUpperCase())
    .optional(),
  settlementCountry: z
    .string()
    .trim()
    .regex(/^[a-zA-Z]{2}$/)
    .transform((value) => value.toUpperCase())
    .optional(),
});

export type CreateRateioResult =
  | { success: true; data: RateioDetailResponseDto }
  | { success: false; error: string };

function safeErrorMessage(error: ApiClientError): string {
  if (error.kind === 'api' && error.statusCode === 401) {
    return 'Sua sessão expirou. Entre novamente para criar um rateio.';
  }
  if (error.kind === 'api' && error.statusCode === 400) {
    return 'Confira os dados do rateio e tente novamente.';
  }
  return 'Não foi possível criar o rateio agora. Tente novamente.';
}

export async function createRateio(
  input: CreateRateioInput,
): Promise<CreateRateioResult> {
  const parsed = createRateioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Confira os dados do rateio.' };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return {
      success: false,
      error: 'Entre na sua conta para criar um rateio.',
    };
  }

  const result = await createApiRateio(accessToken, parsed.data);
  if (result.error !== undefined) {
    return { success: false, error: safeErrorMessage(result.error) };
  }

  return { success: true, data: result.data };
}
