import Link from "next/link";

import { getAccessToken } from "../../lib/auth/server-session";
import { listApiRateios } from "../../lib/api/rateios";
import type { ApiClientError } from "../../lib/api/errors";
import RateioCard from "../../ui/rateio-card";
import { Button } from "../../ui/components/ui/button";

const PAGE_SIZE = 12;

type RateiosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePage(value: string | string[] | undefined): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(rawValue ?? "1", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function errorMessage(error: ApiClientError): string {
  if (error.kind === "api" && error.statusCode === 401) {
    return "Sua sessão expirou. Entre novamente para ver seus rateios.";
  }
  return "Não foi possível carregar seus rateios agora. Tente novamente.";
}

export default async function RateiosPage({
  searchParams,
}: RateiosPageProps) {
  const accessToken = await getAccessToken();
  const page = parsePage((await searchParams).page);
  const result = accessToken
    ? await listApiRateios(accessToken, { page, pageSize: PAGE_SIZE })
    : null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-10 sm:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
            Seus grupos
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">Meus rateios</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Acompanhe suas contas compartilhadas em um só lugar.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/rateios/novo">Novo rateio</Link>
        </Button>
      </div>

      {!accessToken ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Entre para ver seus rateios</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use sua conta do Google para criar e acompanhar seus grupos.
          </p>
          <Button asChild className="mt-5">
            <a href="/api/auth/google">Entrar com Google</a>
          </Button>
        </div>
      ) : result?.error ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-6" role="alert">
          <h2 className="text-xl font-semibold">Não foi possível carregar</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage(result.error)}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/rateios">Tentar novamente</Link>
          </Button>
        </div>
      ) : result?.data.items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Ainda não há rateios</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Crie o primeiro grupo para começar a dividir suas despesas.
          </p>
          <Button asChild className="mt-5">
            <Link href="/rateios/novo">Criar meu primeiro rateio</Link>
          </Button>
        </div>
      ) : result?.data ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.items.map((rateio) => (
              <RateioCard key={rateio.id} rateio={rateio} />
            ))}
          </div>
          {result.data.pages > 1 ? (
            <nav
              className="mt-8 flex items-center justify-between gap-4"
              aria-label="Paginação dos rateios"
            >
              {page > 1 ? (
                <Button asChild variant="outline">
                  <Link href={`/rateios?page=${page - 1}`}>Anterior</Link>
                </Button>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted-foreground">
                Página {result.data.page} de {result.data.pages}
              </span>
              {page < result.data.pages ? (
                <Button asChild variant="outline">
                  <Link href={`/rateios?page=${page + 1}`}>Próxima</Link>
                </Button>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
