import { formatMinorAmount } from "../lib/format";

export interface RateioSessionItem {
  id: string;
  name: string;
  amountMinor: string;
  payerName: string | null;
}

export interface RateioSessionLayoutProps {
  items: RateioSessionItem[];
  totalAmountMinor: string | null;
  participantCount?: number;
  baseCurrency: string;
}

function SessionItems({
  items,
  baseCurrency,
}: Pick<RateioSessionLayoutProps, "items" | "baseCurrency">) {
  return (
    <section
      aria-labelledby="rateio-items-heading"
      className="order-first rounded-lg border border-border bg-card p-5 sm:p-6 lg:order-last"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            Conta compartilhada
          </p>
          <h2 className="mt-2 text-xl font-semibold" id="rateio-items-heading">
            Itens da conta
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">{baseCurrency}</span>
      </div>

      <div className="mt-5 max-h-[min(60dvh,38rem)] overflow-y-auto pr-1">
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
                className="flex items-start justify-between gap-4 rounded-md border border-border p-4"
                key={item.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pago por {item.payerName ?? "participante"}
                  </p>
                </div>
                <span className="shrink-0 font-semibold">
                  {formatMinorAmount(item.amountMinor)}
                </span>
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
  participantCount,
}: Pick<RateioSessionLayoutProps, "totalAmountMinor" | "participantCount">) {
  return (
    <section
      aria-labelledby="rateio-breakdown-heading"
      className="order-last rounded-lg border border-border bg-card p-5 sm:p-6 lg:order-first"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
        Visão geral
      </p>
      <h2 className="mt-2 text-xl font-semibold" id="rateio-breakdown-heading">
        Cálculos e acertos
      </h2>

      <div className="mt-5 rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground">Total registrado</p>
        <p className="mt-1 text-2xl font-semibold">
          {totalAmountMinor === null
            ? "Indisponível"
            : formatMinorAmount(totalAmountMinor)}
        </p>
      </div>

      {participantCount !== undefined ? (
        <div className="mt-3 rounded-md border border-border p-4">
          <p className="text-sm text-muted-foreground">Participantes</p>
          <p className="mt-1 text-lg font-semibold">{participantCount}</p>
        </div>
      ) : null}

      <div className="mt-3 rounded-md border border-dashed border-border p-4">
        <p className="font-medium">Divisão e acertos</p>
        <p className="mt-2 text-sm text-muted-foreground">
          O detalhamento de quem deve pagar ou receber será calculado em uma
          próxima etapa.
        </p>
      </div>
    </section>
  );
}

export default function RateioSessionLayout({
  items,
  totalAmountMinor,
  participantCount,
  baseCurrency,
}: RateioSessionLayoutProps) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
      <SessionItems baseCurrency={baseCurrency} items={items} />
      <RateioBreakdown
        participantCount={participantCount}
        totalAmountMinor={totalAmountMinor}
      />
    </div>
  );
}
