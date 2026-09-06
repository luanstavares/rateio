import "server-only";

import {
  anonymousExpensesControllerCreate,
  anonymousExpensesControllerList,
  expensesControllerCreate,
  expensesControllerList,
  expensesControllerRemoveItem,
  type AnonymousExpenseResponseDto,
  type AnonymousExpenseSessionResponseDto,
  type CreateExpenseDto,
  type ExpenseResponseDto,
  type ExpenseListResponseDto,
  type ExpenseItemDeletionResponseDto,
  type ExpensesControllerListData,
} from "./generated";
import { normalizeApiResult, type ApiResult } from "./errors";
import { createServerApiClient } from "./server-client";

export type CreateExpenseInput = CreateExpenseDto;
export type ListExpensesQuery = ExpensesControllerListData["query"];

export function createApiExpense(
  accessToken: string,
  rateioId: string,
  input: CreateExpenseInput,
): Promise<ApiResult<ExpenseResponseDto>> {
  return expensesControllerCreate({
    client: createServerApiClient(accessToken),
    path: { rateioId },
    body: input,
  }).then((result) => normalizeApiResult<ExpenseResponseDto>(result));
}

export function listApiExpenses(
  accessToken: string,
  rateioId: string,
  query?: ListExpensesQuery,
): Promise<ApiResult<ExpenseListResponseDto>> {
  return expensesControllerList({
    client: createServerApiClient(accessToken),
    path: { rateioId },
    query,
  }).then((result) => normalizeApiResult<ExpenseListResponseDto>(result));
}

export function removeApiExpenseItem(
  accessToken: string,
  rateioId: string,
  expenseId: string,
  itemId: string,
): Promise<ApiResult<ExpenseItemDeletionResponseDto>> {
  return expensesControllerRemoveItem({
    client: createServerApiClient(accessToken),
    path: { rateioId, expenseId, itemId },
  }).then((result) =>
    normalizeApiResult<ExpenseItemDeletionResponseDto>(result),
  );
}

export function listApiAnonymousExpenses(
  sessionToken: string,
  rateioId: string,
): Promise<ApiResult<AnonymousExpenseSessionResponseDto>> {
  return anonymousExpensesControllerList({
    client: createServerApiClient(sessionToken),
    path: { rateioId },
  }).then((result) =>
    normalizeApiResult<AnonymousExpenseSessionResponseDto>(result),
  );
}

export function createApiAnonymousExpense(
  sessionToken: string,
  rateioId: string,
  input: CreateExpenseInput,
): Promise<ApiResult<AnonymousExpenseResponseDto>> {
  return anonymousExpensesControllerCreate({
    client: createServerApiClient(sessionToken),
    path: { rateioId },
    body: input,
  }).then((result) => normalizeApiResult<AnonymousExpenseResponseDto>(result));
}
