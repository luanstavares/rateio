import { createClient } from './generated/client';
import type { Client } from './generated/client';
import { getApiBaseUrl } from './config';

let configuredClient: Client | undefined;

export function getApiClient(): Client {
  configuredClient ??= createClient({
    baseUrl: getApiBaseUrl(),
    responseStyle: 'fields',
    throwOnError: false,
  });

  return configuredClient;
}
