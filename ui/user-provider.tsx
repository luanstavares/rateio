'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import {
  SESSION_CHANNEL,
  SESSION_EVENT,
  notifySessionChange,
  refreshBrowserSession,
  withSessionLock,
  type SessionEvent,
} from '../lib/auth/session-client';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import { readUserSession } from '../app/actions/auth';
import {
  userSessionQueryKey,
  type UserSession,
} from '../lib/auth/user-session';

interface UserContextValue {
  user: UserSession | null;
  userId: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  isLoggingOut: boolean;
  logoutError: Error | null;
}

const UserContext = createContext<UserContextValue | null>(null);

export default function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: UserSession | null | undefined;
}) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const previousIdentity = useRef(initialUser?.userId ?? null);
  const query = useQuery({
    queryKey: userSessionQueryKey,
    queryFn: readUserSession,
    initialData: initialUser,
    placeholderData: (previous) => previous,
    structuralSharing: true,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60_000,
    retry: 1,
  });
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await withSessionLock(async () => {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error('Logout failed');
      });
    },
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.removeQueries({
        predicate: (entry) => entry.queryKey[0] !== userSessionQueryKey[0],
      });
      queryClient.setQueryData<UserSession | null>(userSessionQueryKey, null);
      notifySessionChange('logout');
    },
  });
  const refreshMutation = useMutation({ mutationFn: refreshBrowserSession });
  useEffect(() => {
    const update = (kind: SessionEvent) => {
      if (kind === 'logout' || kind === 'invalid') {
        void queryClient.cancelQueries().then(() => {
          queryClient.removeQueries({
            predicate: (entry) => entry.queryKey[0] !== userSessionQueryKey[0],
          });
          queryClient.setQueryData(userSessionQueryKey, null);
        });
      } else {
        void queryClient.invalidateQueries({ queryKey: userSessionQueryKey });
      }
    };
    const localListener = (event: Event) =>
      update((event as CustomEvent<SessionEvent>).detail);
    window.addEventListener(SESSION_EVENT, localListener);
    const channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(SESSION_CHANNEL)
        : null;
    if (channel)
      channel.onmessage = (event: MessageEvent<unknown>) => {
        if (
          event.data === 'logout' ||
          event.data === 'invalid' ||
          event.data === 'changed'
        )
          update(event.data);
      };
    return () => {
      window.removeEventListener(SESSION_EVENT, localListener);
      channel?.close();
    };
  }, [queryClient]);
  useEffect(() => {
    notifySessionChange('changed');
  }, []);
  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: userSessionQueryKey });
  }, [pathname, queryClient]);
  useEffect(() => {
    if (initialUser !== undefined)
      void queryClient.invalidateQueries({ queryKey: userSessionQueryKey });
  }, [initialUser, queryClient]);
  const user = query.data ?? null;
  useEffect(() => {
    const identity = user?.userId ?? null;
    if (previousIdentity.current !== identity) {
      previousIdentity.current = identity;
      router.refresh();
      void queryClient
        .cancelQueries({
          predicate: (entry) => entry.queryKey[0] !== userSessionQueryKey[0],
        })
        .then(() => {
          queryClient.removeQueries({
            predicate: (entry) => entry.queryKey[0] !== userSessionQueryKey[0],
          });
        });
    }
  }, [user?.userId, queryClient, router]);
  const value = useMemo<UserContextValue>(
    () => ({
      user,
      userId: user?.userId ?? null,
      isLoggedIn: user !== null,
      isLoading: query.isLoading,
      isRefreshing: query.isFetching,
      isError: query.isError,
      error: query.error instanceof Error ? query.error : null,
      logout: logoutMutation.mutateAsync,
      refreshSession: refreshMutation.mutateAsync,
      isLoggingOut: logoutMutation.isPending,
      logoutError:
        logoutMutation.error instanceof Error ? logoutMutation.error : null,
    }),
    [
      query.error,
      query.isError,
      query.isFetching,
      query.isLoading,
      refreshMutation.mutateAsync,
      logoutMutation.mutateAsync,
      logoutMutation.isPending,
      logoutMutation.error,
      user,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const user = useContext(UserContext);
  if (!user) throw new Error('useUser must be used inside UserProvider');
  return user;
}
