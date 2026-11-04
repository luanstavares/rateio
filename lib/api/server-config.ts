import 'server-only';

import { getApiBaseUrl } from './config';

export function getServerApiBaseUrl(): string {
  const configuredUrl = process.env.API_INTERNAL_BASE_URL?.trim();
  if (!configuredUrl) return getApiBaseUrl();

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error('API_INTERNAL_BASE_URL must be a valid URL');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('API_INTERNAL_BASE_URL must use HTTP or HTTPS');
  }

  return configuredUrl.replace(/\/+$/, '');
}
