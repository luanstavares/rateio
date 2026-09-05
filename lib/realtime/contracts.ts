import { z } from "zod";

const timestampSchema = z.iso.datetime();

const memberSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  displayName: z.string(),
  role: z.enum(["OWNER", "ADMIN", "PARTICIPANT"]),
  status: z.enum(["ACTIVE", "REMOVED"]),
  joinedAt: timestampSchema,
});

const allocationSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  memberId: z.string(),
  splitType: z.enum(["EQUAL", "PERCENTAGE", "CUSTOM"]),
  percentageBasisPoints: z.number().int().nullable(),
  baseAmountMinor: z.string(),
  createdAt: timestampSchema,
});

const itemSchema = z.object({
  id: z.string(),
  expenseId: z.string(),
  name: z.string(),
  originalAmountMinor: z.string(),
  originalCurrency: z.string(),
  baseAmountMinor: z.string(),
  baseCurrency: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  allocations: z.array(allocationSchema),
});

const expenseSchema = z.object({
  id: z.string(),
  rateioId: z.string(),
  createdByMemberId: z.string(),
  payerMemberId: z.string(),
  description: z.string(),
  originalAmountMinor: z.string(),
  originalCurrency: z.string(),
  baseAmountMinor: z.string(),
  baseCurrency: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  voidedAt: timestampSchema.nullable(),
  items: z.array(itemSchema),
});

const paymentSchema = z.object({
  id: z.string(),
  rateioId: z.string(),
  payerMemberId: z.string(),
  payeeMemberId: z.string(),
  amountMinor: z.string(),
  currencyCode: z.string(),
  countryCode: z.string(),
  rail: z.enum(["PIX", "MANUAL_BANK_TRANSFER"]),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "EXPIRED",
    "CANCELLED",
    "MANUALLY_COMPLETED",
    "DISPUTED",
  ]),
  expiresAt: timestampSchema.nullable(),
  completedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

const rateioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(["ACTIVE", "CLOSED"]),
  baseCurrency: z.string(),
  settlementCountry: z.string(),
  preferredPaymentRail: z.enum(["PIX", "MANUAL_BANK_TRANSFER"]),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const realtimeStateSnapshotSchema = z.object({
  version: z.literal(1),
  rateio: rateioSchema,
  members: z.array(memberSchema),
  expenses: z.array(expenseSchema),
  payments: z.array(paymentSchema),
  balances: z.array(
    z.object({
      memberId: z.string(),
      displayName: z.string(),
      balanceMinor: z.string(),
    }),
  ),
  totalAmountMinor: z.string(),
});

export const realtimeJoinResponseSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("rateio.joined"),
    data: z.object({ rateioId: z.string(), memberId: z.string() }),
  }),
  z.object({
    event: z.literal("rateio.error"),
    data: z.object({ message: z.enum(["Unauthorized", "Rateio not found"]) }),
  }),
]);

export type RealtimeStateSnapshot = z.infer<
  typeof realtimeStateSnapshotSchema
>;
export type RealtimeJoinResponse = z.infer<
  typeof realtimeJoinResponseSchema
>;

export type RealtimeConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";
