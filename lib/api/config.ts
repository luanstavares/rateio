const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const apiBaseUrl = configuredUrl || DEFAULT_API_BASE_URL;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be a valid URL');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must use HTTP or HTTPS');
  }

  return apiBaseUrl.replace(/\/+$/, '');
}
