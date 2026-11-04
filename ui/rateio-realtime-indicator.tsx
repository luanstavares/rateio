import { BroadcastIcon, WifiSlashIcon } from '@phosphor-icons/react';

import type { RealtimeConnectionStatus } from '../lib/realtime/contracts';

const STATUS_LABELS: Record<RealtimeConnectionStatus, string> = {
  connected: 'Atualizado em tempo real',
  connecting: 'Conectando às atualizações...',
  reconnecting: 'Reconectando às atualizações...',
  error: 'Não foi possível atualizar em tempo real. Recarregue a página.',
  disconnected: 'Atualizações em tempo real desconectadas.',
};

interface RateioRealtimeIndicatorProps {
  status: RealtimeConnectionStatus;
}

export default function RateioRealtimeIndicator({
  status,
}: RateioRealtimeIndicatorProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'reconnecting';
  const Icon =
    status === 'error' || status === 'disconnected'
      ? WifiSlashIcon
      : BroadcastIcon;

  return (
    <span
      role="status"
      title={STATUS_LABELS[status]}
      className={`relative inline-flex size-6 shrink-0 items-center justify-center ${isConnected ? 'text-landing-sage' : isConnecting ? 'text-primary motion-safe:animate-pulse' : status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}
    >
      {isConnected ? (
        <span
          className="absolute size-3 rounded-full bg-landing-sage/20 motion-safe:animate-ping"
          aria-hidden="true"
        />
      ) : null}
      <Icon size={16} aria-hidden="true" />
      <span className="sr-only">{STATUS_LABELS[status]}</span>
    </span>
  );
}
