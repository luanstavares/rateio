import { formatMinorAmount } from '../lib/format';
import RateioItemDeleteButton from './rateio-item-delete-button';

export interface RateioSessionItem {
  id: string;
  expenseId: string;
  createdByMemberId: string;
  name: string;
  amountMinor: string;
  payerName: string | null;
}

export interface RateioSessionBalance {
  memberId: string;
  displayName: string;
  balanceMinor: string;
}

export interface RateioSessionLayoutProps {
  items: RateioSessionItem[];
  totalAmountMinor: string | null;
  balances: RateioSessionBalance[];
  balancesError?: boolean;
  participantCount?: number;
  baseCurrency: string;
  currentMemberId?: string;
  currentRole?: 'OWNER' | 'ADMIN' | 'PARTICIPANT';
}

function SessionItems({
  items,
  baseCurrency,
  currentMemberId,
  currentRole,
}: Pick<
  RateioSessionLayoutProps,
  'items' | 'baseCurrency' | 'currentMemberId' | 'currentRole'
>) {
  return (
    <section
      aria-labelledby="rateio-items-heading"
      className="relative order-first self-start overflow-hidden rounded-2xl border border-border bg-secondary px-6 py-8 sm:p-8 lg:order-last"
    >
      <div
        className="absolute inset-x-6 top-0 h-px bg-primary/60 sm:inset-x-8"
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold" id="rateio-items-heading">
          Itens da conta
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{baseCurrency}</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      <div className="mt-6 max-h-[min(60dvh,38rem)] overflow-y-auto scrollbar-none">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center">
            <p className="font-medium">Nenhum item registrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Os itens adicionados ao rateio aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Itens registrados">
            {items.map((item) => (
              <li
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4"
                key={item.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium" title={item.name}>
                    {item.name}
                  </p>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    Pago por {item.payerName ?? 'participante'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatMinorAmount(item.amountMinor)}
                  </span>
                  {currentMemberId && currentRole ? (
                    <RateioItemDeleteButton
                      createdByMemberId={item.createdByMemberId}
                      currentMemberId={currentMemberId}
                      currentRole={currentRole}
                      expenseId={item.expenseId}
                      itemId={item.id}
                      itemName={item.name}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RateioBreakdown({
  totalAmountMinor,
  balances,
  balancesError,
  participantCount,
}: Pick<
  RateioSessionLayoutProps,
  'totalAmountMinor' | 'balances' | 'balancesError' | 'participantCount'
>) {
  return (
    <section
      aria-labelledby="rateio-breakdown-heading"
      className="relative order-last self-start overflow-hidden rounded-2xl border border-border bg-secondary px-6 py-8 sm:p-8 lg:order-first"
    >
      <div
        className="absolute inset-x-6 top-0 h-px bg-primary/60 sm:inset-x-8"
        aria-hidden="true"
      />
      <h2 className="sr-only" id="rateio-breakdown-heading">
        Cálculos e acertos
      </h2>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Total registrado</p>
          <p className="mt-2 break-words text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
            {totalAmountMinor === null
              ? 'Indisponível'
              : formatMinorAmount(totalAmountMinor)}
          </p>
        </div>
        {participantCount !== undefined ? (
          <p className="mb-1 text-xs text-muted-foreground">
            {participantCount}{' '}
            {participantCount === 1 ? 'participante' : 'participantes'}
          </p>
        ) : null}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        {balancesError ? (
          <p className="text-sm text-muted-foreground" role="alert">
            Não foi possível calcular os saldos agora.
          </p>
        ) : balances.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum saldo calculado ainda.
          </p>
        ) : (
          <ul className="space-y-5" aria-label="Saldos dos participantes">
            {balances.map((balance) => {
              const isCredit =
                !balance.balanceMinor.startsWith('-') &&
                balance.balanceMinor !== '0';
              const isSettled = balance.balanceMinor === '0';
              return (
                <li
                  className="flex items-center justify-between gap-3"
                  key={balance.memberId}
                >
                  <p
                    className="min-w-0 truncate text-sm font-medium"
                    title={balance.displayName}
                  >
                    {balance.displayName}
                  </p>
                  <span
                    className={`flex shrink-0 items-center gap-3 text-sm ${
                      isSettled
                        ? 'text-muted-foreground'
                        : isCredit
                          ? 'text-landing-sage'
                          : 'text-primary'
                    }`}
                  >
                    <span className="text-xs">
                      {isSettled ? 'Acertado' : isCredit ? 'Recebe' : 'Deve'}
                    </span>
                    <span className="min-w-20 text-right font-semibold tabular-nums">
                      {formatMinorAmount(
                        balance.balanceMinor.startsWith('-')
                          ? balance.balanceMinor.slice(1)
                          : balance.balanceMinor,
                      )}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="mt-7 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <span
          className={`size-1.5 shrink-0 rounded-full ${balancesError || balances.length === 0 ? 'bg-muted-foreground' : 'bg-landing-sage'}`}
          aria-hidden="true"
        />
        Divisão e acertos do grupo.
      </div>
    </section>
  );
}

export default function RateioSessionLayout({
  items,
  totalAmountMinor,
  balances,
  balancesError,
  participantCount,
  baseCurrency,
  currentMemberId,
  currentRole,
}: RateioSessionLayoutProps) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
      <SessionItems
        baseCurrency={baseCurrency}
        currentMemberId={currentMemberId}
        currentRole={currentRole}
        items={items}
      />
      <RateioBreakdown
        balances={balances}
        balancesError={balancesError}
        participantCount={participantCount}
        totalAmountMinor={totalAmountMinor}
      />
    </div>
  );
}
