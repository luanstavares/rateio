'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { createClient, type Client } from './generated/client';
import { getApiBaseUrl } from './config';

export type ApiClientVariant = 'api' | 'sameOrigin';

interface ApiClients {
  api: Client;
  sameOrigin: Client;
}

const ApiClientContext = createContext<ApiClients | null>(null);

function createBrowserApiClients(): ApiClients {
  const sharedConfig = {
    responseStyle: 'fields' as const,
    throwOnError: false,
    credentials: 'include' as const,
  };

  return {
    api: createClient({
      ...sharedConfig,
      baseUrl: getApiBaseUrl(),
    }),
    sameOrigin: createClient({
      ...sharedConfig,
      baseUrl: '',
    }),
  };
}

export default function ApiClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [clients] = useState(createBrowserApiClients);

  return (
    <ApiClientContext.Provider value={clients}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient(variant: ApiClientVariant = 'api'): Client {
  const clients = useContext(ApiClientContext);
  if (!clients) {
    throw new Error('useApiClient must be used inside ApiClientProvider');
  }
  return clients[variant];
}
