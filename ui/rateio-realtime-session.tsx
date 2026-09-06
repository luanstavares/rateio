'use client';

import type { RealtimeConnectionStatus } from '../lib/realtime/contracts';
import { useRateio } from './rateio-provider';
import RateioSessionLayout, {
  type RateioSessionBalance,
  type RateioSessionItem,
} from './rateio-session-layout';

function statusMessage(status: RealtimeConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Atualizado em tempo real';
    case 'connecting':
      return 'Conectando às atualizações...';
    case 'reconnecting':
      return 'Reconectando às atualizações...';
    case 'error':
      return 'Não foi possível atualizar em tempo real. Recarregue a página.';
    default:
      return 'Atualizações em tempo real desconectadas.';
  }
}

function statusClassName(status: RealtimeConnectionStatus): string {
  return status === 'error'
    ? 'text-destructive'
    : status === 'connected'
      ? 'text-primary'
      : 'text-muted-foreground';
}

export default function RateioRealtimeSession() {
  const { data, realtimeStatus } = useRateio();
  const memberNames = new Map(
    data.members.map((member) => [member.id, member.displayName]),
  );
  const items: RateioSessionItem[] = data.expenses
    .flatMap((expense) =>
      expense.items.map((item) => ({
        expense,
        item,
      })),
    )
    .sort((left, right) => {
      const dateDifference = right.item.createdAt.localeCompare(
        left.item.createdAt,
      );
      return dateDifference || right.item.id.localeCompare(left.item.id);
    })
    .map(({ expense, item }) => ({
      id: item.id,
      expenseId: item.expenseId,
      createdByMemberId: expense.createdByMemberId,
      name: item.name,
      amountMinor: item.baseAmountMinor,
      payerName: memberNames.get(expense.payerMemberId) ?? null,
    }));
  const balances: RateioSessionBalance[] = data.balances.map((balance) => ({
    memberId: balance.memberId,
    displayName: balance.displayName,
    balanceMinor: balance.balanceMinor,
  }));

  return (
    <>
      <p
        aria-live="polite"
        className={`mt-4 text-sm ${statusClassName(realtimeStatus)}`}
        role="status"
      >
        {statusMessage(realtimeStatus)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {data.rateio.status === 'ACTIVE'
          ? 'Rateio aberto para novas alterações.'
          : 'Rateio fechado para novas alterações.'}
      </p>
      <RateioSessionLayout
        baseCurrency={data.rateio.baseCurrency}
        currentMemberId={data.currentMemberId ?? undefined}
        currentRole={data.currentRole ?? undefined}
        items={items}
        balances={balances}
        participantCount={data.members.length}
        totalAmountMinor={data.totalAmountMinor}
      />
    </>
  );
}
