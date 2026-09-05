"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createApiAnonymousExpense,
  createApiExpense,
} from "../../lib/api/expenses";
import type {
  AnonymousExpenseResponseDto,
  CreateExpenseDto,
  ExpenseResponseDto,
} from "../../lib/api/generated";
import type { ApiClientError } from "../../lib/api/errors";
import {
  getAccessToken,
  getAnonymousSessionToken,
} from "../../lib/auth/server-session";

const allocationSchema = z.object({
  memberId: z.string().trim().min(1),
  splitType: z.enum(["EQUAL", "PERCENTAGE", "CUSTOM"]),
  percentageBasisPoints: z.number().int().min(0).max(10000).optional(),
  baseAmountMinor: z.number().int().positive().safe().optional(),
});

const createExpenseSchema = z
  .object({
    rateioId: z.string().trim().min(1),
    itemName: z.string().trim().min(1).max(180),
    originalAmountMinor: z.number().int().positive().safe(),
    payerMemberId: z.string().trim().min(1),
    originalCurrency: z
      .string()
      .trim()
      .regex(/^[a-zA-Z]{3}$/)
      .transform((value) => value.toUpperCase()),
    allocations: z.array(allocationSchema).min(1),
  })
  .superRefine((input, context) => {
    const memberIds = input.allocations.map((allocation) => allocation.memberId);
    if (new Set(memberIds).size !== memberIds.length) {
      context.addIssue({
        code: "custom",
        path: ["allocations"],
        message: "Os participantes não podem se repetir.",
      });
    }

    const splitTypes = new Set(
      input.allocations.map((allocation) => allocation.splitType),
    );
    if (splitTypes.size !== 1) {
      context.addIssue({
        code: "custom",
        path: ["allocations"],
        message: "Escolha apenas uma forma de divisão.",
      });
      return;
    }

    const splitType = input.allocations[0]?.splitType;
    if (splitType === "PERCENTAGE") {
      const total = input.allocations.reduce(
        (sum, allocation) => sum + (allocation.percentageBasisPoints ?? 0),
        0,
      );
      if (total !== 10000) {
        context.addIssue({
          code: "custom",
          path: ["allocations"],
          message: "As porcentagens devem totalizar 100%.",
        });
      }
    }

    if (splitType === "CUSTOM") {
      const total = input.allocations.reduce(
        (sum, allocation) => sum + (allocation.baseAmountMinor ?? 0),
        0,
      );
      if (total !== input.originalAmountMinor) {
        context.addIssue({
          code: "custom",
          path: ["allocations"],
          message: "Os valores individuais devem totalizar o item.",
        });
      }
    }
  });

export type CreateManualExpenseInput = z.input<typeof createExpenseSchema>;

export type CreateManualExpenseResult =
  | { success: true; data: ExpenseResponseDto | AnonymousExpenseResponseDto }
  | { success: false; error: string };

function errorMessage(error: ApiClientError): string {
  if (error.kind === "api" && error.statusCode === 400) {
    return "Confira o item e a divisão dos participantes.";
  }
  if (error.kind === "api" && error.statusCode === 401) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }
  if (error.kind === "api" && error.statusCode === 403) {
    return "Você não pode adicionar itens neste rateio.";
  }
  if (error.kind === "api" && error.statusCode === 404) {
    return "Este rateio ou participante não foi encontrado.";
  }
  if (error.kind === "api" && error.statusCode === 409) {
    return "Este rateio foi fechado e não aceita novos itens.";
  }
  return "Não foi possível adicionar o item agora. Tente novamente.";
}

export async function createManualExpense(
  input: CreateManualExpenseInput,
): Promise<CreateManualExpenseResult> {
  const parsed = createExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Confira o item e a divisão dos participantes." };
  }

  const body: CreateExpenseDto = {
    description: parsed.data.itemName,
    payerMemberId: parsed.data.payerMemberId,
    originalCurrency: parsed.data.originalCurrency,
    items: [
      {
        name: parsed.data.itemName,
        originalAmountMinor: parsed.data.originalAmountMinor,
        originalCurrency: parsed.data.originalCurrency,
        allocations: parsed.data.allocations,
      },
    ],
  };

  try {
    const accessToken = await getAccessToken();
    const result = accessToken
      ? await createApiExpense(accessToken, parsed.data.rateioId, body)
      : await (async () => {
          const sessionToken = await getAnonymousSessionToken();
          return sessionToken
            ? createApiAnonymousExpense(sessionToken, parsed.data.rateioId, body)
            : { error: { kind: "api", statusCode: 401 } as ApiClientError };
        })();

    if (result.error !== undefined) {
      return { success: false, error: errorMessage(result.error) };
    }

    revalidatePath(`/rateios/${parsed.data.rateioId}`);
    return { success: true, data: result.data };
  } catch {
    return { success: false, error: "Não foi possível adicionar o item agora. Tente novamente." };
  }
}
