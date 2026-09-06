import Link from 'next/link';

import type { ApiClientError } from '../../../lib/api/errors';
import { listApiAnonymousExpenses } from '../../../lib/api/expenses';
import type { AnonymousExpenseSessionResponseDto } from '../../../lib/api/generated';
import { getApiAnonymousRateio, getApiRateio } from '../../../lib/api/rateios';
import {
  listApiAnonymousBalances,
  listApiBalances,
} from '../../../lib/api/settlements';
import {
  getAnonymousSessionToken,
  getCurrentUser,
  getRefreshAwareAccessToken,
} from '../../../lib/auth/server-session';
import {
  normalizeAnonymousSession,
  normalizeAuthenticatedSession,
} from '../../../lib/rateio/session-data';
import ClearAnonymousSession from '../../../ui/clear-anonymous-session';
import { Button } from '../../../ui/components/ui/button';
import RateioPageContent from '../../../ui/rateio-page-content';
import RateioProvider from '../../../ui/rateio-provider';

type RateioDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function searchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function errorMessage(error: ApiClientError): string {
  if (error.kind === 'api' && error.statusCode === 401) {
    return 'Sua sessão expirou. Entre novamente para ver este rateio.';
  }
  if (error.kind === 'api' && error.statusCode === 404) {
    return 'Este rateio não existe ou você não tem acesso a ele.';
  }
  return 'Não foi possível carregar este rateio agora. Tente novamente.';
}

function claimReturnHref(rateioId: string): string {
  const returnTo = encodeURIComponent(`/rateios/${rateioId}`);
  return `/api/auth/google?returnTo=${returnTo}`;
}

export default async function RateioDetailPage({
  params,
  searchParams,
}: RateioDetailPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const claimStatus = searchParamValue(resolvedSearchParams.claim);
  const authError = searchParamValue(resolvedSearchParams.authError);
  const accessToken = await getRefreshAwareAccessToken();
  const anonymousSessionToken = await getAnonymousSessionToken();
  const { id } = await params;
  const [currentUser, result, balancesResult] = accessToken
    ? await Promise.all([
        getCurrentUser(),
        getApiRateio(accessToken, id),
        listApiBalances(accessToken, id),
      ])
    : [null, null, null];
  const anonymousResult =
    !accessToken && anonymousSessionToken
      ? await getApiAnonymousRateio(anonymousSessionToken, id)
      : null;
  const anonymousSessionData =
    !accessToken && anonymousSessionToken && anonymousResult?.data
      ? await Promise.all([
          listApiAnonymousExpenses(anonymousSessionToken, id),
          listApiAnonymousBalances(anonymousSessionToken, id),
        ])
      : null;
  const anonymousExpensesResult = anonymousSessionData?.[0] ?? null;
  const anonymousBalancesResult = anonymousSessionData?.[1] ?? null;

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
      totalAmountMinor: '0',
      expenses: [],
    };
    const initialData = normalizeAnonymousSession(
      anonymousResult.data.rateio,
      anonymousExpensesResult?.data ?? fallbackSession,
      anonymousBalancesResult?.data ?? [],
      anonymousResult.data.participant.id,
    );
    return (
      <RateioProvider initialData={initialData} rateioId={id}>
        <RateioPageContent
          authError={authError === 'oauth'}
          claimStatus={claimStatus}
        />
      </RateioProvider>
    );
  }

  if (!accessToken) {
    const anonymousSessionFailed = anonymousResult?.error !== undefined;
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-8 sm:px-10 sm:py-12">
        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-bold">
            {anonymousSessionFailed
              ? 'Sessão indisponível'
              : 'Entre para ver este rateio'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {anonymousSessionFailed
              ? 'Este acesso anônimo expirou ou foi removido. Entre novamente pelo link compartilhado.'
              : 'Use sua conta do Google ou entre pelo link compartilhado para acompanhar este grupo.'}
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
          {claimStatus === 'error' ? (
            <p className="mt-2 text-sm text-destructive">
              Não foi possível vincular sua participação anônima à conta. Você
              pode tentar novamente pelo mesmo navegador.
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage(result.error)}
          </p>
          {claimStatus === 'error' ? (
            <Button asChild className="mt-5" variant="outline">
              <a href={claimReturnHref(id)}>Tentar vincular novamente</a>
            </Button>
          ) : null}
          <Button
            asChild
            variant="outline"
            className={claimStatus === 'error' ? 'mt-3' : 'mt-5'}
          >
            <Link href="/rateios">Voltar para meus rateios</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (!result?.data) return null;

  const currentMembership = result.data.members.find(
    (member) => member.userId === currentUser?.sub,
  );
  const initialData = normalizeAuthenticatedSession(
    result.data,
    balancesResult?.data ?? [],
    currentMembership?.id ?? null,
    currentMembership?.role ?? null,
  );

  return (
    <RateioProvider initialData={initialData} rateioId={id}>
      <RateioPageContent claimStatus={claimStatus} />
    </RateioProvider>
  );
}
