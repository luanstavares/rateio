'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import ApiClientProvider from '../lib/api/api-client-provider';
import UserProvider from '../ui/user-provider';
import type { UserSession } from '../lib/auth/user-session';

export default function Providers({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: UserSession | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 15_000,
          },
        },
      }),
  );

  return (
    <ApiClientProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider initialUser={initialUser}>{children}</UserProvider>
      </QueryClientProvider>
    </ApiClientProvider>
  );
}
