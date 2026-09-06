'use server';

import { z } from 'zod';
import {
  changeApiRateioStatus,
  changeApiRateioMemberRole,
  createApiRateio,
  createApiShareLink,
  inviteApiRateioMember,
  joinApiRateioAnonymously,
  listApiShareLinks,
  removeApiRateioMember,
  revokeApiShareLink,
  type AnonymousJoinInput,
  type CreateRateioInput,
  type InviteMemberInput,
  type MembershipRole,
  type RateioStatus,
} from '../../lib/api/rateios';
import type { RateioDetailResponseDto } from '../../lib/api/generated';
import type {
  RateioResponseDto,
  ShareLinkCreatedResponseDto,
  ShareLinkMetadataResponseDto,
} from '../../lib/api/generated';
import type {
  InvitationResponseDto,
  MemberResponseDto,
} from '../../lib/api/generated';
import type { ApiClientError } from '../../lib/api/errors';
import { getRefreshAwareAccessToken } from '../../lib/auth/server-session';
import { cookies } from 'next/headers';
import {
  clearAnonymousSessionCookieStore,
  setAnonymousSessionCookieStore,
} from '../../lib/auth/session-cookies';

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

export type ChangeRateioStatusResult =
  | { success: true; data: RateioResponseDto }
  | { success: false; error: string };

export type ShareLinkMetadataResult =
  | { success: true; data: ShareLinkMetadataResponseDto[] }
  | { success: false; error: string };

export type CreateShareLinkResult =
  | { success: true; data: ShareLinkCreatedResponseDto }
  | { success: false; error: string };

export type RevokeShareLinkResult =
  | { success: true; data: ShareLinkMetadataResponseDto }
  | { success: false; error: string };

export type JoinRateioResult =
  | {
      success: true;
      data: { rateioId: string; displayName: string };
    }
  | { success: false; error: string };

export type InviteMemberResult =
  | { success: true; data: InvitationResponseDto }
  | { success: false; error: string };

export type ChangeMemberRoleResult =
  | { success: true; data: MemberResponseDto }
  | { success: false; error: string };

export type RemoveMemberResult =
  | { success: true; data: MemberResponseDto }
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

function safeStatusErrorMessage(error: ApiClientError): string {
  if (error.kind === 'api' && error.statusCode === 401) {
    return 'Sua sessão expirou. Entre novamente para alterar o rateio.';
  }
  if (error.kind === 'api' && error.statusCode === 403) {
    return 'Somente o responsável pelo rateio pode alterar o status.';
  }
  if (error.kind === 'api' && error.statusCode === 404) {
    return 'Este rateio não foi encontrado.';
  }
  if (error.kind === 'api' && error.statusCode === 409) {
    return 'O rateio não pode ter o status alterado agora.';
  }
  return 'Não foi possível alterar o status do rateio. Tente novamente.';
}

function safeShareLinkErrorMessage(error: ApiClientError): string {
  if (error.kind === 'api' && error.statusCode === 401) {
    return 'Sua sessão expirou. Entre novamente para gerenciar o link.';
  }
  if (error.kind === 'api' && error.statusCode === 403) {
    return 'Somente o responsável pelo rateio pode gerenciar o link.';
  }
  if (error.kind === 'api' && error.statusCode === 404) {
    return 'Este rateio ou link não foi encontrado.';
  }
  if (error.kind === 'api' && error.statusCode === 409) {
    return 'O link não pode ser alterado neste momento.';
  }
  return 'Não foi possível gerenciar o link agora. Tente novamente.';
}

function safeMembershipErrorMessage(
  error: ApiClientError,
  operation: 'invite' | 'role' | 'remove',
): string {
  if (error.kind === 'api' && error.statusCode === 401) {
    return 'Sua sessão expirou. Entre novamente para gerenciar os membros.';
  }
  if (error.kind === 'api' && error.statusCode === 403) {
    if (operation === 'invite') {
      return 'Somente responsáveis e administradores podem convidar membros.';
    }
    if (operation === 'role') {
      return 'Somente o responsável pode alterar os papéis.';
    }
    return 'Você não pode remover este membro.';
  }
  if (error.kind === 'api' && error.statusCode === 404) {
    return 'Este rateio ou membro não foi encontrado.';
  }
  if (error.kind === 'api' && error.statusCode === 409) {
    return 'A alteração não pode ser feita neste momento.';
  }
  return 'Não foi possível atualizar os membros agora. Tente novamente.';
}

async function getRequiredAccessToken(): Promise<
  { success: true; token: string } | { success: false; error: string }
> {
  const accessToken = await getRefreshAwareAccessToken();
  return accessToken
    ? { success: true, token: accessToken }
    : {
        success: false,
        error: 'Entre na sua conta para gerenciar este rateio.',
      };
}

const rateioIdSchema = z.string().trim().min(1);

const anonymousJoinSchema = z.object({
  token: z
    .string()
    .trim()
    .length(64)
    .regex(/^[0-9a-f]+$/i),
  displayName: z.string().trim().min(1).max(80),
});

export async function createRateio(
  input: CreateRateioInput,
): Promise<CreateRateioResult> {
  const parsed = createRateioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Confira os dados do rateio.' };
  }

  const accessToken = await getRefreshAwareAccessToken();
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

const changeRateioStatusSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(['ACTIVE', 'CLOSED']),
});

export async function changeRateioStatus(
  id: string,
  status: RateioStatus,
): Promise<ChangeRateioStatusResult> {
  const parsed = changeRateioStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { success: false, error: 'Não foi possível alterar o status.' };
  }

  const accessToken = await getRefreshAwareAccessToken();
  if (!accessToken) {
    return {
      success: false,
      error: 'Entre na sua conta para alterar o status do rateio.',
    };
  }

  const result = await changeApiRateioStatus(
    accessToken,
    parsed.data.id,
    parsed.data.status,
  );
  if (result.error !== undefined) {
    return { success: false, error: safeStatusErrorMessage(result.error) };
  }

  return { success: true, data: result.data };
}

export async function listShareLinks(
  rateioId: string,
): Promise<ShareLinkMetadataResult> {
  const parsedRateioId = rateioIdSchema.safeParse(rateioId);
  if (!parsedRateioId.success) {
    return { success: false, error: 'Este rateio não é válido.' };
  }

  const session = await getRequiredAccessToken();
  if (!session.success) return session;

  const result = await listApiShareLinks(session.token, parsedRateioId.data);
  if (result.error !== undefined) {
    return { success: false, error: safeShareLinkErrorMessage(result.error) };
  }

  return { success: true, data: result.data };
}

export async function createShareLink(
  rateioId: string,
): Promise<CreateShareLinkResult> {
  const parsedRateioId = rateioIdSchema.safeParse(rateioId);
  if (!parsedRateioId.success) {
    return { success: false, error: 'Este rateio não é válido.' };
  }

  const session = await getRequiredAccessToken();
  if (!session.success) return session;

  const result = await createApiShareLink(session.token, parsedRateioId.data);
  if (result.error !== undefined) {
    return { success: false, error: safeShareLinkErrorMessage(result.error) };
  }

  return { success: true, data: result.data };
}

export async function revokeShareLink(
  rateioId: string,
  shareLinkId: string,
): Promise<RevokeShareLinkResult> {
  const parsedIds = z
    .object({ rateioId: rateioIdSchema, shareLinkId: rateioIdSchema })
    .safeParse({ rateioId, shareLinkId });
  if (!parsedIds.success) {
    return { success: false, error: 'Este link não é válido.' };
  }

  const session = await getRequiredAccessToken();
  if (!session.success) return session;

  const result = await revokeApiShareLink(
    session.token,
    parsedIds.data.rateioId,
    parsedIds.data.shareLinkId,
  );
  if (result.error !== undefined) {
    return { success: false, error: safeShareLinkErrorMessage(result.error) };
  }

  return { success: true, data: result.data };
}

const inviteMemberSchema = z.object({
  rateioId: rateioIdSchema,
  email: z.email(),
});

export async function inviteRateioMember(
  rateioId: string,
  input: InviteMemberInput,
): Promise<InviteMemberResult> {
  const parsed = inviteMemberSchema.safeParse({ rateioId, ...input });
  if (!parsed.success) {
    return { success: false, error: 'Informe um e-mail válido.' };
  }

  const session = await getRequiredAccessToken();
  if (!session.success) return session;

  const result = await inviteApiRateioMember(
    session.token,
    parsed.data.rateioId,
    { email: parsed.data.email },
  );
  if (result.error !== undefined) {
    return {
      success: false,
      error: safeMembershipErrorMessage(result.error, 'invite'),
    };
  }
  return { success: true, data: result.data };
}

const memberRoleSchema = z.object({
  rateioId: rateioIdSchema,
  memberId: rateioIdSchema,
  role: z.enum(['ADMIN', 'PARTICIPANT']),
});

export async function changeRateioMemberRole(
  rateioId: string,
  memberId: string,
  role: MembershipRole,
): Promise<ChangeMemberRoleResult> {
  const parsed = memberRoleSchema.safeParse({ rateioId, memberId, role });
  if (!parsed.success) {
    return { success: false, error: 'Escolha um papel válido para o membro.' };
  }

  const session = await getRequiredAccessToken();
  if (!session.success) return session;

  const result = await changeApiRateioMemberRole(
    session.token,
    parsed.data.rateioId,
    parsed.data.memberId,
    parsed.data.role,
  );
  if (result.error !== undefined) {
    return {
      success: false,
      error: safeMembershipErrorMessage(result.error, 'role'),
    };
  }
  return { success: true, data: result.data };
}

const removeMemberSchema = z.object({
  rateioId: rateioIdSchema,
  memberId: rateioIdSchema,
});

export async function removeRateioMember(
  rateioId: string,
  memberId: string,
): Promise<RemoveMemberResult> {
  const parsed = removeMemberSchema.safeParse({ rateioId, memberId });
  if (!parsed.success) {
    return { success: false, error: 'Este membro não é válido.' };
  }

  const session = await getRequiredAccessToken();
  if (!session.success) return session;

  const result = await removeApiRateioMember(
    session.token,
    parsed.data.rateioId,
    parsed.data.memberId,
  );
  if (result.error !== undefined) {
    return {
      success: false,
      error: safeMembershipErrorMessage(result.error, 'remove'),
    };
  }
  return { success: true, data: result.data };
}

function safeJoinErrorMessage(error: ApiClientError): string {
  if (error.kind === 'api' && error.statusCode === 400) {
    return 'Confira o link e seu nome para entrar no rateio.';
  }
  if (error.kind === 'api' && error.statusCode === 404) {
    return 'Este link não é válido ou já foi revogado.';
  }
  return 'Não foi possível entrar neste rateio agora. Tente novamente.';
}

export async function joinRateioAnonymously(
  input: AnonymousJoinInput,
): Promise<JoinRateioResult> {
  const parsed = anonymousJoinSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Confira o link e seu nome para entrar.' };
  }

  const result = await joinApiRateioAnonymously(parsed.data);
  if (result.error !== undefined) {
    return { success: false, error: safeJoinErrorMessage(result.error) };
  }

  const cookieStore = await cookies();
  setAnonymousSessionCookieStore(cookieStore, result.data.sessionToken);

  return {
    success: true,
    data: {
      rateioId: result.data.rateio.id,
      displayName: result.data.participant.displayName,
    },
  };
}

export async function clearAnonymousSession(): Promise<{ success: true }> {
  const cookieStore = await cookies();
  clearAnonymousSessionCookieStore(cookieStore);
  return { success: true };
}
