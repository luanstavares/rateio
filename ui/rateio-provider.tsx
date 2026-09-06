'use client';

import {
  useQuery,
  useQueryClient,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getApiBaseUrl } from '../lib/api/config';
import {
  realtimeJoinResponseSchema,
  realtimeStateSnapshotSchema,
  type RealtimeConnectionStatus,
} from '../lib/realtime/contracts';
import {
  isRateioSessionData,
  normalizeRealtimeSnapshot,
  type RateioSessionData,
} from '../lib/rateio/session-data';
import { useApiClient } from '../lib/api/api-client-provider';
import {
  createManualExpense,
  removeExpenseItem,
  type CreateManualExpenseInput,
  type CreateManualExpenseResult,
  type RemoveExpenseItemResult,
} from '../app/actions/expenses';
import {
  changeRateioMemberRole,
  changeRateioStatus,
  createShareLink,
  removeRateioMember,
  revokeShareLink,
  type ChangeMemberRoleResult,
  type ChangeRateioStatusResult,
  type CreateShareLinkResult,
  type RemoveMemberResult,
  type RevokeShareLinkResult,
} from '../app/actions/rateios';
import type { MembershipRole, RateioStatus } from '../lib/api/rateios';

export const rateioSessionQueryKey = (rateioId: string) =>
  ['rateio-session', rateioId] as const;

export const rateioShareLinksQueryKey = (rateioId: string) =>
  ['rateio-share-links', rateioId] as const;

export interface RateioMutationContext {
  addExpense: UseMutationResult<
    CreateManualExpenseResult,
    Error,
    CreateManualExpenseInput
  >;
  removeItem: UseMutationResult<
    RemoveExpenseItemResult,
    Error,
    { expenseId: string; itemId: string }
  >;
  changeStatus: UseMutationResult<
    ChangeRateioStatusResult,
    Error,
    RateioStatus
  >;
  changeMemberRole: UseMutationResult<
    ChangeMemberRoleResult,
    Error,
    { memberId: string; role: MembershipRole }
  >;
  removeMember: UseMutationResult<RemoveMemberResult, Error, string>;
  createShareLink: UseMutationResult<CreateShareLinkResult, Error, void>;
  revokeShareLink: UseMutationResult<RevokeShareLinkResult, Error, string>;
}

interface RateioProviderValue {
  data: RateioSessionData;
  error: UseQueryResult<RateioSessionData>['error'];
  isFetching: boolean;
  isPending: boolean;
  realtimeStatus: RealtimeConnectionStatus;
  mutations: RateioMutationContext;
  refetch: UseQueryResult<RateioSessionData>['refetch'];
  invalidate: () => Promise<void>;
}

const RateioContext = createContext<RateioProviderValue | null>(null);

interface RateioProviderProps {
  rateioId: string;
  initialData: RateioSessionData;
  children: ReactNode;
}

async function fetchRateioSession(
  client: ReturnType<typeof useApiClient>,
  rateioId: string,
): Promise<RateioSessionData> {
  const result = await client.get<RateioSessionData, { message?: string }>({
    url: '/api/rateios/{id}/session',
    path: { id: rateioId },
    responseStyle: 'fields',
    throwOnError: false,
  });
  if (result.error || !result.data) {
    throw new Error('Não foi possível atualizar este rateio.');
  }
  const value: unknown = result.data;
  if (!isRateioSessionData(value)) {
    throw new Error('A resposta do rateio é inválida.');
  }
  return value;
}

type ServerToClientEvents = {
  'rateio.state': (snapshot: unknown) => void;
};

type ClientToServerEvents = {
  'rateio.join': (
    payload: { rateioId: string },
    acknowledge: (response: unknown) => void,
  ) => void;
};

type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

async function refreshAuthenticatedSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default function RateioProvider({
  rateioId,
  initialData,
  children,
}: RateioProviderProps) {
  const queryClient = useQueryClient();
  const client = useApiClient('sameOrigin');
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeConnectionStatus>('connecting');
  const refreshInFlight = useRef<Promise<boolean> | null>(null);
  const query = useQuery({
    queryKey: rateioSessionQueryKey(rateioId),
    queryFn: () => fetchRateioSession(client, rateioId),
    initialData,
    placeholderData: (previous) => previous,
    structuralSharing: true,
  });
  const data = query.data ?? initialData;
  const invalidateRateio = async () => {
    await queryClient.invalidateQueries({
      queryKey: rateioSessionQueryKey(rateioId),
    });
  };
  const addExpense = useMutation({
    mutationFn: (input: CreateManualExpenseInput) => createManualExpense(input),
    onSuccess: async (result) => {
      if (result.success) await invalidateRateio();
    },
  });
  const removeItem = useMutation({
    mutationFn: ({
      expenseId,
      itemId,
    }: {
      expenseId: string;
      itemId: string;
    }) => removeExpenseItem(rateioId, expenseId, itemId),
    onSuccess: async (result) => {
      if (result.success) await invalidateRateio();
    },
  });
  const changeStatus = useMutation({
    mutationFn: (status: RateioStatus) => changeRateioStatus(rateioId, status),
    onSuccess: async (result) => {
      if (result.success) await invalidateRateio();
    },
  });
  const changeMemberRole = useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: MembershipRole;
    }) => changeRateioMemberRole(rateioId, memberId, role),
    onSuccess: async (result) => {
      if (result.success) await invalidateRateio();
    },
  });
  const removeMember = useMutation({
    mutationFn: (memberId: string) => removeRateioMember(rateioId, memberId),
    onSuccess: async (result) => {
      if (result.success) await invalidateRateio();
    },
  });
  const createShareLinkMutation = useMutation({
    mutationFn: () => createShareLink(rateioId),
    onSuccess: async (result) => {
      if (result.success) {
        await Promise.all([
          invalidateRateio(),
          queryClient.invalidateQueries({
            queryKey: rateioShareLinksQueryKey(rateioId),
          }),
        ]);
      }
    },
  });
  const revokeShareLinkMutation = useMutation({
    mutationFn: (shareLinkId: string) => revokeShareLink(rateioId, shareLinkId),
    onSuccess: async (result) => {
      if (result.success) {
        await Promise.all([
          invalidateRateio(),
          queryClient.invalidateQueries({
            queryKey: rateioShareLinksQueryKey(rateioId),
          }),
        ]);
      }
    },
  });
  const mutations = useMemo<RateioMutationContext>(
    () => ({
      addExpense,
      removeItem,
      changeStatus,
      changeMemberRole,
      removeMember,
      createShareLink: createShareLinkMutation,
      revokeShareLink: revokeShareLinkMutation,
    }),
    [
      addExpense,
      removeItem,
      changeStatus,
      changeMemberRole,
      removeMember,
      createShareLinkMutation,
      revokeShareLinkMutation,
    ],
  );

  useEffect(() => {
    let mounted = true;
    const socket: RealtimeSocket = io(`${getApiBaseUrl()}/rateios`, {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
    });
    const setMountedStatus = (status: RealtimeConnectionStatus) => {
      if (mounted) setRealtimeStatus(status);
    };
    const refreshAndReconnect = () => {
      if (data.mode !== 'authenticated' || refreshInFlight.current) {
        return;
      }

      const refresh = refreshAuthenticatedSession();
      refreshInFlight.current = refresh;
      void refresh.then((refreshed) => {
        refreshInFlight.current = null;
        if (!mounted || !refreshed) return;
        setMountedStatus('reconnecting');
        socket.connect();
      });
    };

    socket.on('connect', () => {
      setMountedStatus('connected');
      socket.emit('rateio.join', { rateioId }, (response) => {
        const parsed = realtimeJoinResponseSchema.safeParse(response);
        if (!parsed.success || parsed.data.event === 'rateio.error') {
          setMountedStatus('error');
          socket.disconnect();
        }
      });
    });
    socket.on('rateio.state', (payload) => {
      const parsed = realtimeStateSnapshotSchema.safeParse(payload);
      if (!parsed.success || parsed.data.rateio.id !== rateioId) {
        setMountedStatus('error');
        return;
      }
      queryClient.setQueryData<RateioSessionData>(
        rateioSessionQueryKey(rateioId),
        (current) =>
          current ? normalizeRealtimeSnapshot(parsed.data, current) : current,
      );
    });
    socket.on('disconnect', (reason) => {
      setMountedStatus(
        reason === 'io client disconnect' ? 'disconnected' : 'reconnecting',
      );
      if (reason === 'io server disconnect') refreshAndReconnect();
    });
    socket.on('connect_error', () => {
      setMountedStatus('error');
      refreshAndReconnect();
    });
    socket.io.on('reconnect_attempt', () => {
      setMountedStatus('reconnecting');
    });

    socket.connect();
    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [data.mode, queryClient, rateioId]);

  const value = useMemo<RateioProviderValue>(
    () => ({
      data,
      error: query.error,
      isFetching: query.isFetching,
      isPending: query.isPending,
      realtimeStatus,
      mutations,
      refetch: query.refetch,
      invalidate: async () => {
        await queryClient.invalidateQueries({
          queryKey: rateioSessionQueryKey(rateioId),
        });
      },
    }),
    [
      data,
      query.error,
      query.isFetching,
      query.isPending,
      query.refetch,
      queryClient,
      rateioId,
      realtimeStatus,
      mutations,
    ],
  );

  return (
    <RateioContext.Provider value={value}>{children}</RateioContext.Provider>
  );
}

export function useRateio(): RateioProviderValue {
  const value = useContext(RateioContext);
  if (!value) {
    throw new Error('useRateio must be used inside RateioProvider');
  }
  return value;
}

export function useRateioMutations(): RateioMutationContext {
  return useRateio().mutations;
}
