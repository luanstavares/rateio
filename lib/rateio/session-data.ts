import type {
    AnonymousExpenseSessionResponseDto,
    BalanceResponseDto,
    RateioDetailResponseDto,
} from "../api/generated";
import type { RealtimeStateSnapshot } from "../realtime/contracts";

export type RateioSessionMode = "authenticated" | "anonymous";
export type RateioSessionRole = "OWNER" | "ADMIN" | "PARTICIPANT";

export interface RateioSessionUser {
    id: string;
    name: string | null;
    email: string;
    pictureUrl: string | null;
}

export interface RateioSessionMember {
    id: string;
    rateioId: string;
    userId: string | null;
    displayName: string;
    role: RateioSessionRole;
    status: "ACTIVE" | "REMOVED";
    joinedAt: string;
    user: RateioSessionUser | null;
}

export interface RateioSessionAllocation {
    id: string;
    itemId: string;
    memberId: string;
    splitType: "EQUAL" | "PERCENTAGE" | "CUSTOM";
    percentageBasisPoints: number | null;
    baseAmountMinor: string;
    createdAt: string;
}

export interface RateioSessionItem {
    id: string;
    expenseId: string;
    name: string;
    originalAmountMinor: string;
    originalCurrency: string;
    baseAmountMinor: string;
    baseCurrency: string;
    createdAt: string;
    updatedAt: string;
    allocations: RateioSessionAllocation[];
}

export interface RateioSessionExpense {
    id: string;
    rateioId: string;
    createdByMemberId: string;
    payerMemberId: string;
    description: string;
    originalAmountMinor: string;
    originalCurrency: string;
    baseAmountMinor: string;
    baseCurrency: string;
    createdAt: string;
    updatedAt: string;
    voidedAt: string | null;
    items: RateioSessionItem[];
}

export interface RateioSessionActivityEvent {
    id: string;
    rateioId: string;
    actorId: string | null;
    type: string;
    payload: Record<string, unknown>;
    createdAt: string;
}

export interface RateioSessionBalance {
    memberId: string;
    displayName: string;
    balanceMinor: string;
    userId: string | null;
    email: string;
}

export interface RateioSessionData {
    mode: RateioSessionMode;
    rateio: {
        id: string;
        ownerId: string | null;
        title: string;
        description: string | null;
        status: "ACTIVE" | "CLOSED";
        baseCurrency: string;
        settlementCountry: string;
        preferredPaymentRail: string;
        createdAt: string;
        updatedAt: string;
    };
    members: RateioSessionMember[];
    expenses: RateioSessionExpense[];
    activityEvents: RateioSessionActivityEvent[];
    balances: RateioSessionBalance[];
    totalAmountMinor: string;
    currentMemberId: string | null;
    currentRole: RateioSessionRole | null;
}

function recordValue(value: unknown): Record<string, unknown> | null {
    return typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)
        : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === "string" && value.trim() ? value : null;
}

function minorString(value: unknown): string {
    return typeof value === "string" || typeof value === "number" || typeof value === "bigint"
        ? String(value)
        : "0";
}

function dateString(value: unknown): string {
    return stringValue(value) ?? "1970-01-01T00:00:00.000Z";
}

function roleValue(value: unknown): RateioSessionRole {
    return value === "OWNER" || value === "ADMIN" ? value : "PARTICIPANT";
}

function statusValue(value: unknown): "ACTIVE" | "REMOVED" {
    return value === "REMOVED" ? "REMOVED" : "ACTIVE";
}

function compareNewest<T extends { createdAt: string; id: string }>(
    left: T,
    right: T,
): number {
    const dateDifference = right.createdAt.localeCompare(left.createdAt);
    return dateDifference || right.id.localeCompare(left.id);
}

function compareOldest<T extends { joinedAt: string; id: string }>(
    left: T,
    right: T,
): number {
    const dateDifference = left.joinedAt.localeCompare(right.joinedAt);
    return dateDifference || left.id.localeCompare(right.id);
}

function normalizeUser(value: unknown): RateioSessionUser | null {
    const user = recordValue(value);
    if (!user) return null;
    const id = stringValue(user.id);
    const email = stringValue(user.email);
    if (!id || !email) return null;
    return {
        id,
        name: stringValue(user.name),
        email,
        pictureUrl: stringValue(user.pictureUrl),
    };
}

function normalizeMember(value: unknown): RateioSessionMember {
    const member = recordValue(value) ?? {};
    const user = normalizeUser(member.user);
    return {
        id: stringValue(member.id) ?? "",
        rateioId: stringValue(member.rateioId) ?? "",
        userId: stringValue(member.userId) ?? user?.id ?? null,
        displayName:
            stringValue(member.displayName) ?? user?.name ?? "Participante",
        role: roleValue(member.role),
        status: statusValue(member.status),
        joinedAt: dateString(member.joinedAt),
        user,
    };
}

function normalizeAllocation(value: unknown): RateioSessionAllocation {
    const allocation = recordValue(value) ?? {};
    const percentage = allocation.percentageBasisPoints;
    return {
        id: stringValue(allocation.id) ?? "",
        itemId: stringValue(allocation.itemId) ?? "",
        memberId: stringValue(allocation.memberId) ?? "",
        splitType:
            allocation.splitType === "PERCENTAGE" ||
            allocation.splitType === "CUSTOM"
                ? allocation.splitType
                : "EQUAL",
        percentageBasisPoints:
            typeof percentage === "number" ? percentage : null,
        baseAmountMinor: minorString(allocation.baseAmountMinor),
        createdAt: dateString(allocation.createdAt),
    };
}

function normalizeItem(value: unknown): RateioSessionItem {
    const item = recordValue(value) ?? {};
    const allocations = Array.isArray(item.allocations)
        ? item.allocations.map(normalizeAllocation)
        : [];
    return {
        id: stringValue(item.id) ?? "",
        expenseId: stringValue(item.expenseId) ?? "",
        name: stringValue(item.name) ?? "Item sem nome",
        originalAmountMinor: minorString(item.originalAmountMinor),
        originalCurrency: stringValue(item.originalCurrency) ?? "BRL",
        baseAmountMinor: minorString(item.baseAmountMinor),
        baseCurrency: stringValue(item.baseCurrency) ?? "BRL",
        createdAt: dateString(item.createdAt),
        updatedAt: dateString(item.updatedAt),
        allocations: allocations.sort((left, right) =>
            left.id.localeCompare(right.id),
        ),
    };
}

function normalizeExpense(value: unknown): RateioSessionExpense {
    const expense = recordValue(value) ?? {};
    const items = Array.isArray(expense.items)
        ? expense.items.map(normalizeItem)
        : [];
    return {
        id: stringValue(expense.id) ?? "",
        rateioId: stringValue(expense.rateioId) ?? "",
        createdByMemberId: stringValue(expense.createdByMemberId) ?? "",
        payerMemberId: stringValue(expense.payerMemberId) ?? "",
        description: stringValue(expense.description) ?? "",
        originalAmountMinor: minorString(expense.originalAmountMinor),
        originalCurrency: stringValue(expense.originalCurrency) ?? "BRL",
        baseAmountMinor: minorString(expense.baseAmountMinor),
        baseCurrency: stringValue(expense.baseCurrency) ?? "BRL",
        createdAt: dateString(expense.createdAt),
        updatedAt: dateString(expense.updatedAt),
        voidedAt: stringValue(expense.voidedAt),
        items: items.sort((left, right) =>
            compareNewest(left, right),
        ),
    };
}

function normalizeActivity(value: unknown): RateioSessionActivityEvent {
    const event = recordValue(value) ?? {};
    return {
        id: stringValue(event.id) ?? "",
        rateioId: stringValue(event.rateioId) ?? "",
        actorId: stringValue(event.actorId),
        type: stringValue(event.type) ?? "UNKNOWN",
        payload: recordValue(event.payload) ?? {},
        createdAt: dateString(event.createdAt),
    };
}

function normalizeRateio(value: unknown): RateioSessionData["rateio"] {
    const rateio = recordValue(value) ?? {};
    return {
        id: stringValue(rateio.id) ?? "",
        ownerId: stringValue(rateio.ownerId),
        title: stringValue(rateio.title) ?? "Rateio",
        description: stringValue(rateio.description),
        status: rateio.status === "CLOSED" ? "CLOSED" : "ACTIVE",
        baseCurrency: stringValue(rateio.baseCurrency) ?? "BRL",
        settlementCountry: stringValue(rateio.settlementCountry) ?? "BR",
        preferredPaymentRail:
            stringValue(rateio.preferredPaymentRail) ?? "PIX",
        createdAt: dateString(rateio.createdAt),
        updatedAt: dateString(rateio.updatedAt),
    };
}

function normalizeBalances(
    values: readonly unknown[],
    members: RateioSessionMember[],
): RateioSessionBalance[] {
    const memberMap = new Map(members.map((member) => [member.id, member]));
    return values
        .map((value) => {
            const balance = recordValue(value) ?? {};
            const memberId = stringValue(balance.memberId) ?? "";
            const member = memberMap.get(memberId);
            return {
                memberId,
                displayName:
                    stringValue(balance.displayName) ??
                    stringValue(balance.name) ??
                    member?.displayName ??
                    "Participante",
                balanceMinor: minorString(balance.balanceMinor),
                userId: stringValue(balance.userId) ?? member?.userId ?? null,
                email: stringValue(balance.email) ?? member?.user?.email ?? "",
            };
        })
        .sort((left, right) => left.memberId.localeCompare(right.memberId));
}

function normalizeSession(
    mode: RateioSessionMode,
    rateio: unknown,
    members: readonly unknown[],
    expenses: readonly unknown[],
    balances: readonly unknown[],
    totalAmountMinor: unknown,
    currentMemberId: string | null,
    currentRole: RateioSessionRole | null,
    activityEvents: readonly unknown[] = [],
): RateioSessionData {
    const normalizedMembers = members
        .map(normalizeMember)
        .sort(compareOldest);
    const currentMember = currentMemberId
        ? normalizedMembers.find((member) => member.id === currentMemberId)
        : undefined;
    return {
        mode,
        rateio: normalizeRateio(rateio),
        members: normalizedMembers,
        expenses: expenses.map(normalizeExpense).sort((left, right) =>
            compareNewest(left, right),
        ),
        activityEvents: activityEvents
            .map(normalizeActivity)
            .sort((left, right) => compareNewest(left, right)),
        balances: normalizeBalances(balances, normalizedMembers),
        totalAmountMinor: minorString(totalAmountMinor),
        currentMemberId,
        currentRole: currentMember ? currentMember.role : currentRole,
    };
}

export function normalizeAuthenticatedSession(
    rateio: RateioDetailResponseDto,
    balances: readonly BalanceResponseDto[],
    currentMemberId: string | null,
    currentRole: RateioSessionRole | null,
): RateioSessionData {
    return normalizeSession(
        "authenticated",
        rateio,
        rateio.members,
        rateio.expenses,
        balances,
        rateio.totalAmountMinor,
        currentMemberId,
        currentRole,
        rateio.activityEvents,
    );
}

export function normalizeAnonymousSession(
    rateio: { id: string; title: string; description?: string | null; status: "ACTIVE" | "CLOSED"; baseCurrency: string },
    expenses: AnonymousExpenseSessionResponseDto,
    balances: readonly unknown[],
    currentMemberId: string | null,
): RateioSessionData {
    return normalizeSession(
        "anonymous",
        rateio,
        expenses.members,
        expenses.expenses,
        balances,
        expenses.totalAmountMinor,
        currentMemberId,
        "PARTICIPANT",
    );
}

export function normalizeRealtimeSnapshot(
    snapshot: RealtimeStateSnapshot,
    current: RateioSessionData,
): RateioSessionData {
    const currentMembers = new Map(
        current.members.map((member) => [member.id, member]),
    );
    const members = snapshot.members.map((member) => {
        const previous = currentMembers.get(member.id);
        return {
            ...member,
            rateioId: current.rateio.id,
            user: previous?.user ?? null,
        };
    });

    return normalizeSession(
        current.mode,
        { ...current.rateio, ...snapshot.rateio },
        members,
        snapshot.expenses,
        snapshot.balances,
        snapshot.totalAmountMinor,
        current.currentMemberId,
        current.currentRole,
        current.activityEvents,
    );
}

export function isRateioSessionData(value: unknown): value is RateioSessionData {
    const session = recordValue(value);
    return Boolean(
        session &&
            (session.mode === "authenticated" || session.mode === "anonymous") &&
            recordValue(session.rateio) &&
            Array.isArray(session.members) &&
            Array.isArray(session.expenses) &&
            Array.isArray(session.balances) &&
            typeof session.totalAmountMinor === "string",
    );
}
