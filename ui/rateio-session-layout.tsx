import { formatMinorAmount } from "../lib/format";
import RateioItemDeleteButton from "./rateio-item-delete-button";

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
    currentRole?: "OWNER" | "ADMIN" | "PARTICIPANT";
}

function SessionItems({
    items,
    baseCurrency,
    currentMemberId,
    currentRole,
}: Pick<
    RateioSessionLayoutProps,
    "items" | "baseCurrency" | "currentMemberId" | "currentRole"
>) {
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
                    <h2
                        className="mt-2 text-xl font-semibold"
                        id="rateio-items-heading"
                    >
                        Itens da conta
                    </h2>
                </div>
                <span className="text-sm text-muted-foreground">
                    {baseCurrency}
                </span>
            </div>

            <div className="mt-5 max-h-[min(60dvh,38rem)] overflow-y-auto scrollbar-none">
                {items.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border p-6 text-center">
                        <p className="font-medium">Nenhum item registrado</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Os itens adicionados ao rateio aparecerão aqui.
                        </p>
                    </div>
                ) : (
                    <ul
                        className="space-y-3"
                        aria-label="Itens registrados"
                    >
                        {items.map((item) => (
                            <li
                                className="flex items-start justify-between gap-4 rounded-md border border-border p-4"
                                key={item.id}
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {item.name}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Pago por{" "}
                                        {item.payerName ?? "participante"}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="font-semibold">
                                        {formatMinorAmount(item.amountMinor)}
                                    </span>
                                    {currentMemberId && currentRole ? (
                                        <RateioItemDeleteButton
                                            createdByMemberId={
                                                item.createdByMemberId
                                            }
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
    "totalAmountMinor" | "balances" | "balancesError" | "participantCount"
>) {
    return (
        <section
            aria-labelledby="rateio-breakdown-heading"
            className="order-last rounded-lg border border-border bg-card p-5 sm:p-6 lg:order-first"
        >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                Visão geral
            </p>
            <h2
                className="mt-2 text-xl font-semibold"
                id="rateio-breakdown-heading"
            >
                Cálculos e acertos
            </h2>

            <div className="mt-5 rounded-md border border-border p-4">
                <p className="text-sm text-muted-foreground">
                    Total registrado
                </p>
                <p className="mt-1 text-2xl font-semibold">
                    {totalAmountMinor === null
                        ? "Indisponível"
                        : formatMinorAmount(totalAmountMinor)}
                </p>
            </div>

            {participantCount !== undefined ? (
                <div className="mt-3 rounded-md border border-border p-4">
                    <p className="text-sm text-muted-foreground">
                        Participantes
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                        {participantCount}
                    </p>
                </div>
            ) : null}

            <div className="mt-3 rounded-md border border-border p-4">
                <p className="font-medium">Divisão e acertos</p>
                {balancesError ? (
                    <p
                        className="mt-2 text-sm text-muted-foreground"
                        role="alert"
                    >
                        Não foi possível calcular os saldos agora.
                    </p>
                ) : balances.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Nenhum saldo calculado ainda.
                    </p>
                ) : (
                    <ul
                        className="mt-3 space-y-3"
                        aria-label="Saldos dos participantes"
                    >
                        {balances.map((balance) => {
                            const isCredit =
                                !balance.balanceMinor.startsWith("-") &&
                                balance.balanceMinor !== "0";
                            const isSettled = balance.balanceMinor === "0";
                            return (
                                <li
                                    className="flex items-center justify-between gap-4"
                                    key={balance.memberId}
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {balance.displayName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {isSettled
                                                ? "Acertado"
                                                : isCredit
                                                  ? "Recebe"
                                                  : "Deve"}
                                        </p>
                                    </div>
                                    <span className="shrink-0 font-semibold">
                                        {formatMinorAmount(
                                            balance.balanceMinor.startsWith("-")
                                                ? balance.balanceMinor.slice(1)
                                                : balance.balanceMinor,
                                        )}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
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
