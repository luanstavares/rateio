import { NextResponse } from 'next/server';

import {
  getAnonymousSessionToken,
  getCurrentUser,
  getRefreshAwareAccessToken,
} from '../../../../../lib/auth/server-session';
import { listApiAnonymousExpenses } from '../../../../../lib/api/expenses';
import {
  getApiAnonymousRateio,
  getApiRateio,
} from '../../../../../lib/api/rateios';
import {
  listApiAnonymousBalances,
  listApiBalances,
} from '../../../../../lib/api/settlements';
import {
  normalizeAnonymousSession,
  normalizeAuthenticatedSession,
} from '../../../../../lib/rateio/session-data';

type RouteContext = { params: Promise<{ id: string }> };

function errorStatus(error: unknown): number {
  if (
    typeof error === 'object' &&
    error !== null &&
    'kind' in error &&
    error.kind === 'api' &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  ) {
    return error.statusCode;
  }
  return 502;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const accessToken = await getRefreshAwareAccessToken();

  if (accessToken) {
    const [currentUser, rateioResult, balancesResult] = await Promise.all([
      getCurrentUser(),
      getApiRateio(accessToken, id),
      listApiBalances(accessToken, id),
    ]);
    if (rateioResult.error || balancesResult.error) {
      const error = rateioResult.error ?? balancesResult.error;
      return NextResponse.json(
        { error: 'Não foi possível atualizar este rateio.' },
        { status: errorStatus(error) },
      );
    }
    const currentMember = rateioResult.data.members.find(
      (member) => member.userId === currentUser?.sub,
    );
    return NextResponse.json(
      normalizeAuthenticatedSession(
        rateioResult.data,
        balancesResult.data,
        currentMember?.id ?? null,
        currentMember?.role ?? null,
      ),
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const anonymousToken = await getAnonymousSessionToken();
  if (!anonymousToken) {
    return NextResponse.json(
      { error: 'Sessão não encontrada.' },
      { status: 401 },
    );
  }

  const rateioResult = await getApiAnonymousRateio(anonymousToken, id);
  if (rateioResult.error) {
    return NextResponse.json(
      { error: 'Não foi possível atualizar este rateio.' },
      { status: errorStatus(rateioResult.error) },
    );
  }
  const [expensesResult, balancesResult] = await Promise.all([
    listApiAnonymousExpenses(anonymousToken, id),
    listApiAnonymousBalances(anonymousToken, id),
  ]);
  if (expensesResult.error || balancesResult.error) {
    const error = expensesResult.error ?? balancesResult.error;
    return NextResponse.json(
      { error: 'Não foi possível atualizar este rateio.' },
      { status: errorStatus(error) },
    );
  }

  return NextResponse.json(
    normalizeAnonymousSession(
      rateioResult.data.rateio,
      expensesResult.data,
      balancesResult.data,
      rateioResult.data.participant.id,
    ),
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
