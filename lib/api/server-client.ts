import 'server-only';

import { createClient } from './generated/client';
import type { Client } from './generated/client';
import { getServerApiBaseUrl } from './server-config';

export function createServerApiClient(accessToken?: string): Client {
  return createClient({
    baseUrl: getServerApiBaseUrl(),
    responseStyle: 'fields',
    throwOnError: false,
    // SDK auth injection is disabled; this server-only boundary owns the header.
    ...(accessToken === undefined
      ? {}
      : { headers: { Authorization: `Bearer ${accessToken}` } }),
  });
}
