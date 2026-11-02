'use client';

export const SESSION_EVENT = 'rateio-session-change';
export const SESSION_CHANNEL = 'rateio-session';
export type SessionEvent = 'changed' | 'logout' | 'invalid';
let sessionQueue: Promise<unknown> = Promise.resolve();
let retryAfter = 0;
let refreshInFlight: Promise<boolean> | null = null;

export function notifySessionChange(kind: SessionEvent): void {
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: kind }));
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(SESSION_CHANNEL);
    channel.postMessage(kind);
    channel.close();
  }
}

export function withSessionLock<T>(operation: () => Promise<T>): Promise<T> {
  const task = sessionQueue
    .catch(() => undefined)
    .then(() =>
      typeof navigator !== 'undefined' && navigator.locks
        ? navigator.locks.request('rateio-session', operation)
        : operation(),
    );
  sessionQueue = task;
  return task;
}

export function refreshBrowserSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  if (Date.now() < retryAfter) return Promise.resolve(false);
  retryAfter = Date.now() + 5000;
  refreshInFlight = withSessionLock(async () => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) {
      notifySessionChange('changed');
      return true;
    }
    if (response.status === 401) notifySessionChange('invalid');
    return false;
  })
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}
