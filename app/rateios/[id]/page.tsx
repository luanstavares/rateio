import Link from "next/link";

import { getApiAnonymousRateio, getApiRateio } from "../../../lib/api/rateios";
import type { RateioDetailResponseDto } from "../../../lib/api/generated";
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

function AnonymousSessionView({
  participant,
  rateio,
}: {
  participant: { displayName: string };
  rateio: {
    title: string;
    description?: unknown;
    status: "ACTIVE" | "CLOSED";
    baseCurrency: string;
  };
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-dashed border-border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            Próxima etapa
          </p>
          <h2 className="mt-3 text-xl font-semibold">Itens e despesas</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A lista de itens e o lançamento de despesas entram em uma próxima
            feature.
          </p>
        </section>
        <section className="rounded-lg border border-dashed border-border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            Divisão e acertos
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            O cálculo de saldos e a divisão das dívidas serão adicionados em uma
            próxima feature.
          </p>
        </section>
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

  if (!accessToken && anonymousResult?.data) {
    return <AnonymousSessionView {...anonymousResult.data} />;
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-dashed border-border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            Próxima etapa
          </p>
          <h2 className="mt-3 text-xl font-semibold">Itens e despesas</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A lista de itens e o lançamento de despesas entram em uma próxima
            feature.
          </p>
        </section>
        <section className="rounded-lg border border-dashed border-border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            Próxima etapa
          </p>
          <h2 className="mt-3 text-xl font-semibold">Divisão e acertos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O cálculo de saldos e a divisão das dívidas serão adicionados em uma
            próxima feature.
          </p>
        </section>
      </div>
    </section>
  );
}
