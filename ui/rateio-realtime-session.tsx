'use client';

import { participantProfile } from '../lib/rateio/participant-profile';
import { useRateio } from './rateio-provider';
import RateioSessionLayout, {
  type RateioSessionBalance,
  type RateioSessionItem,
} from './rateio-session-layout';

export default function RateioRealtimeSession() {
  const { data, realtimeStatus } = useRateio();
  const memberProfiles = new Map(
    data.members.map((member) => [member.id, participantProfile(member)]),
  );
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
    pictureUrl: memberProfiles.get(balance.memberId)?.pictureUrl ?? null,
  }));

  return (
    <RateioSessionLayout
      baseCurrency={data.rateio.baseCurrency}
      currentMemberId={data.currentMemberId ?? undefined}
      currentRole={data.currentRole ?? undefined}
      items={items}
      balances={balances}
      participantCount={data.members.length}
      totalAmountMinor={data.totalAmountMinor}
      realtimeStatus={realtimeStatus}
    />
  );
}
