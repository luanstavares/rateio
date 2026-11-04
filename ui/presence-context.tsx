'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

const PresenceContext = createContext<ReadonlySet<string>>(new Set());

interface PresenceProviderProps {
  onlineUserIds: readonly string[];
  children: ReactNode;
}

export function PresenceProvider({
  onlineUserIds,
  children,
}: PresenceProviderProps) {
  const online = useMemo(() => new Set(onlineUserIds), [onlineUserIds]);
  return (
    <PresenceContext.Provider value={online}>
      {children}
    </PresenceContext.Provider>
  );
}

export function useUserOnline(userId?: string | null): boolean {
  const online = useContext(PresenceContext);
  return !!userId && online.has(userId);
}
