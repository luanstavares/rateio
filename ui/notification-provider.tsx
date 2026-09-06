'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useApiClient } from '../lib/api/api-client-provider';
import {
  compareNotifications,
  listNotifications,
  mergeNotification,
  normalizeRealtimeNotification,
  readNotification,
  type Notification,
  type NotificationList,
} from '../lib/api/notifications';
import { getApiBaseUrl } from '../lib/api/config';
import {
  realtimeNotificationCreatedSchema,
  type RealtimeConnectionStatus,
} from '../lib/realtime/contracts';
import { useUser } from './user-provider';
import { io, type Socket } from 'socket.io-client';

export function notificationsQueryKey(userId: string | null) {
  return ['notifications', userId] as const;
}
const EMPTY_NOTIFICATIONS: Notification[] = [];

interface NotificationProviderValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  realtimeStatus: RealtimeConnectionStatus;
  refetch: () => Promise<unknown>;
  markRead: UseMutationResult<Notification, Error, string>;
}

const NotificationContext = createContext<NotificationProviderValue | null>(
  null,
);

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = useUser();
  const client = useApiClient('api');
  const queryClient = useQueryClient();
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeConnectionStatus>('disconnected');
  const refreshInFlight = useRef<Promise<boolean> | null>(null);
  const queryKey = useMemo(() => notificationsQueryKey(userId), [userId]);
  const query = useQuery<NotificationList, Error>({
    queryKey,
    queryFn: () => listNotifications(client),
    enabled: userId !== null,
    structuralSharing: true,
  });
  const markRead = useMutation({
    mutationFn: (notificationId: string) =>
      readNotification(client, notificationId),
    onSuccess: async (notification) => {
      queryClient.setQueryData<NotificationList>(queryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items
            .map((item) => (item.id === notification.id ? notification : item))
            .sort(compareNotifications),
        };
      });
      await queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  useEffect(() => {
    if (!userId) return;

    type ServerToClientEvents = {
      'notification.created': (payload: unknown) => void;
    };
    type NotificationSocket = Socket<ServerToClientEvents>;
    let mounted = true;
    const socket: NotificationSocket = io(`${getApiBaseUrl()}/rateios`, {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
    });
    const setMountedStatus = (status: RealtimeConnectionStatus) => {
      if (mounted) setRealtimeStatus(status);
    };
    const refreshAndReconnect = () => {
      if (refreshInFlight.current) return;
      const refresh = fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
      })
        .then((response) => response.ok)
        .catch(() => false);
      refreshInFlight.current = refresh;
      void refresh.then((refreshed) => {
        refreshInFlight.current = null;
        if (mounted && refreshed) socket.connect();
      });
    };

    socket.on('connect', () => setMountedStatus('connected'));
    socket.on('notification.created', (payload) => {
      const parsed = realtimeNotificationCreatedSchema.safeParse(payload);
      if (!parsed.success) {
        setMountedStatus('error');
        void queryClient.invalidateQueries({ queryKey });
        return;
      }
      const notification = normalizeRealtimeNotification(parsed.data);
      if (!notification) {
        void queryClient.invalidateQueries({ queryKey });
        return;
      }
      if (notification.userId !== userId) return;
      queryClient.setQueryData<NotificationList>(queryKey, (current) =>
        current ? mergeNotification(current, notification) : current,
      );
    });
    socket.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') {
        setMountedStatus('disconnected');
        return;
      }
      setMountedStatus('reconnecting');
      if (reason === 'io server disconnect') refreshAndReconnect();
    });
    socket.on('connect_error', () => {
      setMountedStatus('error');
      refreshAndReconnect();
    });
    socket.io.on('reconnect_attempt', () => setMountedStatus('reconnecting'));

    setMountedStatus('connecting');
    socket.connect();
    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [queryClient, queryKey, userId]);
  const notifications = query.data?.items ?? EMPTY_NOTIFICATIONS;
  const value = useMemo<NotificationProviderValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.readAt)
        .length,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      error: query.error ?? null,
      realtimeStatus: userId ? realtimeStatus : 'disconnected',
      refetch: query.refetch,
      markRead,
    }),
    [markRead, notifications, query, realtimeStatus, userId],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationProviderValue {
  const value = useContext(NotificationContext);
  if (!value)
    throw new Error(
      'useNotifications must be used inside NotificationProvider',
    );
  return value;
}
