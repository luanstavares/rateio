import 'server-only';

import { createClient } from './generated/client';
import type { Client } from './generated/client';
import { getApiBaseUrl } from './config';

export function createServerApiClient(accessToken?: string): Client {
  return createClient({
    baseUrl: getApiBaseUrl(),
    responseStyle: 'fields',
    throwOnError: false,
    ...(accessToken === undefined ? {} : { auth: accessToken }),
  });
}
