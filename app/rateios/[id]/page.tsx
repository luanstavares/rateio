import Link from "next/link";

import { listApiAnonymousExpenses } from "../../../lib/api/expenses";
import { getApiAnonymousRateio, getApiRateio } from "../../../lib/api/rateios";
import type {
  AnonymousExpenseSessionResponseDto,
  RateioDetailResponseDto,
  RateioMemberResponseDto,
} from "../../../lib/api/generated";
import type { ApiClientError } from "../../../lib/api/errors";
import {
  getAccessToken,
  getAnonymousSessionToken,
  getCurrentUser,
} from "../../../lib/auth/server-session";
import { formatMinorAmount } from "../../../lib/format";
import { Button } from "../../../ui/components/ui/button";
import ClearAnonymousSession from "../../../ui/clear-anonymous-session";
import RateioShareLinkDrawer from "../../../ui/rateio-share-link-drawer";
import ManualExpenseDrawer, {
  type ExpenseMemberOption,
} from "../../../ui/manual-expense-drawer";
import RateioSessionLayout, {
  type RateioSessionItem,
} from "../../../ui/rateio-session-layout";
import RateioStatusControl from "../../../ui/rateio-status-control";

type RateioDetailPageProps = {
  params: Promise<{ id: string }>;
};

function descriptionText(description: unknown): string | null {
  return typeof description === "string" ? description : null;
}

function errorMessage(error: ApiClientError): string {
  if (error.kind === "api" && error.statusCode === 401) {
    return "Sua sessão expirou. Entre novamente para ver este rateio.";
  }
  if (error.kind === "api" && error.statusCode === 404) {
    return "Este rateio não existe ou você não tem acesso a ele.";
  }
  return "Não foi possível carregar este rateio agora. Tente novamente.";
}

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function statusClassName(status: RateioDetailResponseDto["status"]): string {
  return status === "ACTIVE"
    ? "border-primary/50 text-primary"
    : "border-muted-foreground/50 text-muted-foreground";
}

function sessionItemsForRateio(
  rateio: RateioDetailResponseDto,
): RateioSessionItem[] {
  return rateio.expenses.flatMap((expense) =>
    expense.items.map((item) => {
      const payerName = expense.payerMember?.user?.name;
      return {
        id: item.id,
        name: item.name,
        amountMinor: String(item.baseAmountMinor),
        payerName: typeof payerName === "string" ? payerName : null,
      };
    }),
  );
}

function memberDisplayName(member: RateioMemberResponseDto): string {
  const name: unknown = member.user?.name;
  return typeof name === "string" && name.trim() ? name : "Participante";
}

function expenseMembersForRateio(
  members: RateioMemberResponseDto[],
): ExpenseMemberOption[] {
  return members.map((member) => ({
    id: member.id,
    displayName: memberDisplayName(member),
  }));
}

function totalForAnonymousSession(
  session: AnonymousExpenseSessionResponseDto,
): string {
  return String(
    session.expenses.reduce(
      (total, expense) => total + BigInt(expense.baseAmountMinor),
      BigInt(0),
    ),
  );
}

function sessionItemsForAnonymousRateio(
  session: AnonymousExpenseSessionResponseDto,
): RateioSessionItem[] {
  const payerNames = new Map(
    session.members.map((member) => [member.id, member.displayName]),
  );
  return session.expenses.flatMap((expense) =>
    expense.items.map((item) => ({
      id: item.id,
      name: item.name,
      amountMinor: item.baseAmountMinor,
      payerName: payerNames.get(expense.payerMemberId) ?? null,
    })),
  );
}

function AnonymousSessionView({
  participant,
  rateio,
  expenseSession,
}: {
  participant: { displayName: string };
  rateio: {
    id: string;
    title: string;
    description?: unknown;
    status: "ACTIVE" | "CLOSED";
    baseCurrency: string;
  };
  expenseSession: AnonymousExpenseSessionResponseDto;
}) {
  const description = descriptionText(rateio.description);
  const isActive = rateio.status === "ACTIVE";

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-10 sm:py-12">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
              Sessão compartilhada
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              {rateio.title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {description ?? "Sem descrição"}
            </p>
          </div>
          <p className="shrink-0 text-sm text-muted-foreground">
            {rateio.baseCurrency}
          </p>
        </div>

        <div className="mt-6 rounded-md border border-border p-4">
          <p className="text-sm text-muted-foreground">Você entrou como</p>
          <p className="mt-1 font-semibold">{participant.displayName}</p>
        </div>

        {!isActive ? (
          <div className="mt-4 rounded-md border border-muted-foreground/40 bg-muted/40 p-4 text-sm text-muted-foreground">
            Este rateio está fechado para novas alterações.
          </div>
        ) : null}
      </div>

      <RateioSessionLayout
        baseCurrency={rateio.baseCurrency}
        items={sessionItemsForAnonymousRateio(expenseSession)}
        participantCount={expenseSession.members.length}
        totalAmountMinor={totalForAnonymousSession(expenseSession)}
      />
      <div className="mt-6 flex justify-end">
        <ManualExpenseDrawer
          baseCurrency={rateio.baseCurrency}
          isActive={isActive}
          members={expenseSession.members.map((member) => ({
            id: member.id,
            displayName: member.displayName,
          }))}
          rateioId={rateio.id}
        />
      </div>
    </section>
  );
}

export default async function RateioDetailPage({
  params,
}: RateioDetailPageProps) {
  const accessToken = await getAccessToken();
  const anonymousSessionToken = await getAnonymousSessionToken();
  const { id } = await params;
  const [currentUser, result] = accessToken
    ? await Promise.all([getCurrentUser(), getApiRateio(accessToken, id)])
    : [null, null];
  const anonymousResult =
    !accessToken && anonymousSessionToken
      ? await getApiAnonymousRateio(anonymousSessionToken, id)
      : null;
  const anonymousExpensesResult =
    !accessToken && anonymousSessionToken && anonymousResult?.data
      ? await listApiAnonymousExpenses(anonymousSessionToken, id)
      : null;

  if (!accessToken && anonymousResult?.data) {
    const fallbackSession: AnonymousExpenseSessionResponseDto = {
      members: [
        {
          id: anonymousResult.data.participant.id,
          displayName: anonymousResult.data.participant.displayName,
          role: anonymousResult.data.participant.role,
          status: anonymousResult.data.participant.status,
          joinedAt: anonymousResult.data.participant.joinedAt,
        },
      ],
      expenses: [],
    };
    return (
      <AnonymousSessionView
        {...anonymousResult.data}
        expenseSession={anonymousExpensesResult?.data ?? fallbackSession}
      />
    );
  }

  if (!accessToken) {
    const anonymousSessionFailed = anonymousResult?.error !== undefined;
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-8 sm:px-10 sm:py-12">
        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-bold">
            {anonymousSessionFailed
              ? "Sessão indisponível"
              : "Entre para ver este rateio"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {anonymousSessionFailed
              ? "Este acesso anônimo expirou ou foi removido. Entre novamente pelo link compartilhado."
              : "Use sua conta do Google ou entre pelo link compartilhado para acompanhar este grupo."}
          </p>
          {anonymousSessionFailed ? <ClearAnonymousSession /> : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {anonymousSessionFailed ? (
              <Button asChild variant="outline">
                <Link href="/rateios/entrar">Usar outro link</Link>
              </Button>
            ) : null}
            <Button asChild>
              <a href="/api/auth/google">Entrar com Google</a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (result?.error) {
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-8 sm:px-10 sm:py-12">
        <div
          className="rounded-lg border border-border bg-card p-6"
          role="alert"
        >
          <h1 className="text-2xl font-bold">Rateio indisponível</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage(result.error)}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/rateios">Voltar para meus rateios</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (!result?.data) return null;

  const rateio = result.data;
  const description = descriptionText(rateio.description);
  const isOwner = currentUser?.sub === rateio.ownerId;
  const isActive = rateio.status === "ACTIVE";

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-10 sm:py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-4">
          <Link href="/rateios">← Meus rateios</Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-2 py-1 text-xs font-medium ${statusClassName(rateio.status)}`}
              >
                {isActive ? "Ativo" : "Fechado"}
              </span>
              {isOwner ? (
                <span className="text-xs text-muted-foreground">
                  Você é o responsável
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              {rateio.title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {description ?? "Sem descrição"}
            </p>
          </div>
          <p className="shrink-0 text-sm text-muted-foreground">
            {rateio.baseCurrency}
          </p>
        </div>

        {!isActive ? (
          <div className="mt-6 rounded-md border border-muted-foreground/40 bg-muted/40 p-4 text-sm text-muted-foreground">
            Este rateio está fechado para novas alterações.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-border p-4">
            <p className="text-xs text-muted-foreground">Total registrado</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatMinorAmount(rateio.totalAmountMinor)}
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-xs text-muted-foreground">Participantes</p>
            <p className="mt-2 text-2xl font-semibold">
              {countLabel(rateio.members.length, "membro", "membros")}
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-xs text-muted-foreground">Despesas</p>
            <p className="mt-2 text-2xl font-semibold">
              {countLabel(rateio.expenses.length, "despesa", "despesas")}
            </p>
          </div>
        </div>

        {isOwner ? (
          <>
            <RateioStatusControl rateioId={rateio.id} status={rateio.status} />
            <RateioShareLinkDrawer rateioId={rateio.id} />
          </>
        ) : null}
      </div>

      <RateioSessionLayout
        baseCurrency={rateio.baseCurrency}
        items={sessionItemsForRateio(rateio)}
        participantCount={rateio.members.length}
        totalAmountMinor={rateio.totalAmountMinor}
      />
      <div className="mt-6 flex justify-end">
        <ManualExpenseDrawer
          baseCurrency={rateio.baseCurrency}
          isActive={isActive}
          members={expenseMembersForRateio(rateio.members)}
          rateioId={rateio.id}
        />
      </div>
    </section>
  );
}
