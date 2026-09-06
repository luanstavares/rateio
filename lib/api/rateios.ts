import 'server-only';

import {
  anonymousShareLinksControllerJoin,
  anonymousRateiosControllerGet,
  rateiosControllerClaimAnonymousParticipant,
  rateiosControllerChangeStatus,
  rateiosControllerCreate,
  rateiosControllerCreateShareLink,
  rateiosControllerGet,
  rateiosControllerInvite,
  rateiosControllerList,
  rateiosControllerListShareLinks,
  rateiosControllerRemoveMember,
  rateiosControllerRevokeShareLink,
  rateiosControllerRole,
  type AnonymousJoinDto,
  type AnonymousJoinResponseDto,
  type AnonymousSessionResponseDto,
  type ClaimAnonymousParticipantDto,
  type ClaimAnonymousParticipantResponseDto,
  type ChangeRateioStatusDto,
  type ChangeMemberRoleDto,
  type CreateRateioDto,
  type InvitationResponseDto,
  type InviteMemberDto,
  type MemberResponseDto,
  type RateioDetailResponseDto,
  type RateioListResponseDto,
  type RateioResponseDto,
  type RateiosControllerListData,
  type ShareLinkCreatedResponseDto,
  type ShareLinkMetadataResponseDto,
} from './generated';
import { normalizeApiResult, type ApiResult } from './errors';
import { createServerApiClient } from './server-client';

export type CreateRateioInput = CreateRateioDto;
export type ListRateiosQuery = RateiosControllerListData['query'];
export type RateioStatus = ChangeRateioStatusDto['status'];
export type AnonymousJoinInput = AnonymousJoinDto;
export type MembershipRole = ChangeMemberRoleDto['role'];
export type InviteMemberInput = InviteMemberDto;
export type ClaimAnonymousParticipantInput = ClaimAnonymousParticipantDto;

export function createApiRateio(
  accessToken: string,
  input: CreateRateioInput,
): Promise<ApiResult<RateioDetailResponseDto>> {
  return rateiosControllerCreate({
    client: createServerApiClient(accessToken),
    body: input,
  }).then((result) => normalizeApiResult<RateioDetailResponseDto>(result));
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
  }).then((result) => normalizeApiResult<RateioDetailResponseDto>(result));
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

export function listApiShareLinks(
  accessToken: string,
  rateioId: string,
): Promise<ApiResult<ShareLinkMetadataResponseDto[]>> {
  return rateiosControllerListShareLinks({
    client: createServerApiClient(accessToken),
    path: { id: rateioId },
  }).then((result) =>
    normalizeApiResult<ShareLinkMetadataResponseDto[]>(result),
  );
}

export function createApiShareLink(
  accessToken: string,
  rateioId: string,
): Promise<ApiResult<ShareLinkCreatedResponseDto>> {
  return rateiosControllerCreateShareLink({
    client: createServerApiClient(accessToken),
    path: { id: rateioId },
  }).then((result) => normalizeApiResult<ShareLinkCreatedResponseDto>(result));
}

export function revokeApiShareLink(
  accessToken: string,
  rateioId: string,
  shareLinkId: string,
): Promise<ApiResult<ShareLinkMetadataResponseDto>> {
  return rateiosControllerRevokeShareLink({
    client: createServerApiClient(accessToken),
    path: { id: rateioId, shareLinkId },
  }).then((result) => normalizeApiResult<ShareLinkMetadataResponseDto>(result));
}

export function joinApiRateioAnonymously(
  input: AnonymousJoinInput,
): Promise<ApiResult<AnonymousJoinResponseDto>> {
  return anonymousShareLinksControllerJoin({
    client: createServerApiClient(),
    body: input,
  }).then((result) => normalizeApiResult<AnonymousJoinResponseDto>(result));
}

export function getApiAnonymousRateio(
  sessionToken: string,
  rateioId: string,
): Promise<ApiResult<AnonymousSessionResponseDto>> {
  return anonymousRateiosControllerGet({
    client: createServerApiClient(sessionToken),
    path: { id: rateioId },
  }).then((result) => normalizeApiResult<AnonymousSessionResponseDto>(result));
}

export function claimApiAnonymousParticipant(
  accessToken: string,
  input: ClaimAnonymousParticipantInput,
): Promise<ApiResult<ClaimAnonymousParticipantResponseDto>> {
  return rateiosControllerClaimAnonymousParticipant({
    client: createServerApiClient(accessToken),
    body: input,
  }).then((result) =>
    normalizeApiResult<ClaimAnonymousParticipantResponseDto>(result),
  );
}

export function inviteApiRateioMember(
  accessToken: string,
  rateioId: string,
  input: InviteMemberInput,
): Promise<ApiResult<InvitationResponseDto>> {
  return rateiosControllerInvite({
    client: createServerApiClient(accessToken),
    path: { id: rateioId },
    body: input,
  }).then((result) => normalizeApiResult<InvitationResponseDto>(result));
}

export function changeApiRateioMemberRole(
  accessToken: string,
  rateioId: string,
  memberId: string,
  role: MembershipRole,
): Promise<ApiResult<MemberResponseDto>> {
  return rateiosControllerRole({
    client: createServerApiClient(accessToken),
    path: { id: rateioId, memberId },
    body: { role },
  }).then((result) => normalizeApiResult<MemberResponseDto>(result));
}

export function removeApiRateioMember(
  accessToken: string,
  rateioId: string,
  memberId: string,
): Promise<ApiResult<MemberResponseDto>> {
  return rateiosControllerRemoveMember({
    client: createServerApiClient(accessToken),
    path: { id: rateioId, memberId },
  }).then((result) => normalizeApiResult<MemberResponseDto>(result));
}
