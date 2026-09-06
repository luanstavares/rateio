'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
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
}

const UserContext = createContext<UserContextValue | null>(null);

export default function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: UserSession | null;
}) {
  const query = useQuery({
    queryKey: userSessionQueryKey,
    queryFn: readUserSession,
    initialData: initialUser,
    placeholderData: (previous) => previous,
    structuralSharing: true,
  });
  const user = query.data ?? null;
  const value = useMemo<UserContextValue>(
    () => ({
      user,
      userId: user?.userId ?? null,
      isLoggedIn: user !== null,
      isLoading: query.isLoading,
      isRefreshing: query.isFetching,
      isError: query.isError,
      error: query.error instanceof Error ? query.error : null,
    }),
    [query.error, query.isError, query.isFetching, query.isLoading, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const user = useContext(UserContext);
  if (!user) throw new Error('useUser must be used inside UserProvider');
  return user;
}
