"use client";

import { XIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
    createManualExpense,
    type CreateManualExpenseInput,
    type CreateManualExpenseResult,
} from "../app/actions/expenses";
import { Button } from "./components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./components/ui/drawer";

export interface ExpenseMemberOption {
    id: string;
    displayName: string;
}

interface ManualExpenseDrawerProps {
    rateioId: string;
    baseCurrency: string;
    members: ExpenseMemberOption[];
    isActive: boolean;
}

type SplitType = "EQUAL" | "PERCENTAGE" | "CUSTOM";
type AllocationResult =
    | { allocations: CreateManualExpenseInput["allocations"] }
    | { error: string };

function parseMinorAmount(value: string): number | null {
    const normalized = value.trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

    const [whole, fraction = ""] = normalized.split(".");
    const amount = Number(`${whole}${fraction.padEnd(2, "0")}`);
    return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

function formatInputAmount(value: string): string {
    return value.replace(/[^\d,.]/g, "");
}

function inputClassName(): string {
    return "mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
}

function splitLabel(splitType: SplitType): string {
    if (splitType === "PERCENTAGE") return "Por porcentagem";
    if (splitType === "CUSTOM") return "Valores personalizados";
    return "Igual para todos";
}

export default function ManualExpenseDrawer({
    rateioId,
    baseCurrency,
    members,
    isActive,
}: ManualExpenseDrawerProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [itemName, setItemName] = useState("");
    const [amount, setAmount] = useState("");
    const [payerMemberId, setPayerMemberId] = useState(members[0]?.id ?? "");
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
        members.map((member) => member.id),
    );
    const [splitType, setSplitType] = useState<SplitType>("EQUAL");
    const [percentages, setPercentages] = useState<Record<string, string>>({});
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
        {},
    );
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const selectedMembers = useMemo(
        () => members.filter((member) => selectedMemberIds.includes(member.id)),
        [members, selectedMemberIds],
    );

    function resetForm() {
        setItemName("");
        setAmount("");
        setPayerMemberId(members[0]?.id ?? "");
        setSelectedMemberIds(members.map((member) => member.id));
        setSplitType("EQUAL");
        setPercentages({});
        setCustomAmounts({});
        setError(null);
    }

    function toggleMember(memberId: string) {
        setSelectedMemberIds((current) =>
            current.includes(memberId)
                ? current.filter((id) => id !== memberId)
                : [...current, memberId],
        );
    }

    function buildAllocations(amountMinor: number): AllocationResult {
        if (selectedMemberIds.length === 0) {
            return {
                error: "Selecione pelo menos uma pessoa para dividir o item.",
            };
        }

        if (splitType === "EQUAL") {
            return {
                allocations: selectedMemberIds.map((memberId) => ({
                    memberId,
                    splitType,
                })),
            };
        }

        if (splitType === "PERCENTAGE") {
            const allocations = selectedMemberIds.map((memberId) => {
                const percentage = Number(
                    (percentages[memberId] ?? "").trim().replace(",", "."),
                );
                return {
                    memberId,
                    splitType,
                    percentageBasisPoints:
                        Number.isFinite(percentage) && percentage >= 0
                            ? Math.round(percentage * 100)
                            : -1,
                };
            });
            if (
                allocations.some(
                    (allocation) =>
                        allocation.percentageBasisPoints < 0 ||
                        allocation.percentageBasisPoints > 10000,
                ) ||
                allocations.reduce(
                    (sum, allocation) => sum + allocation.percentageBasisPoints,
                    0,
                ) !== 10000
            ) {
                return { error: "As porcentagens devem totalizar 100%." };
            }
            return { allocations };
        }

        const allocations = selectedMemberIds.map((memberId) => ({
            memberId,
            splitType,
            baseAmountMinor:
                parseMinorAmount(customAmounts[memberId] ?? "") ?? -1,
        }));
        if (
            allocations.some((allocation) => allocation.baseAmountMinor <= 0) ||
            allocations.reduce(
                (sum, allocation) => sum + allocation.baseAmountMinor,
                0,
            ) !== amountMinor
        ) {
            return { error: "Os valores individuais devem totalizar o item." };
        }
        return { allocations };
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        const amountMinor = parseMinorAmount(amount);
        if (!itemName.trim() || amountMinor === null || !payerMemberId) {
            setError("Informe o nome, o valor e quem pagou pelo item.");
            return;
        }

        const allocationResult = buildAllocations(amountMinor);
        if ("error" in allocationResult) {
            setError(allocationResult.error);
            return;
        }

        const input: CreateManualExpenseInput = {
            rateioId,
            itemName,
            originalAmountMinor: amountMinor,
            payerMemberId,
            originalCurrency: baseCurrency,
            allocations: allocationResult.allocations,
        };

        startTransition(async () => {
            const result: CreateManualExpenseResult =
                await createManualExpense(input);
            if (!result.success) {
                setError(result.error);
                return;
            }
            resetForm();
            setOpen(false);
            router.refresh();
        });
    }

    return (
        <Drawer
            open={open}
            onOpenChange={setOpen}
            shouldScaleBackground={false}
        >
            <DrawerTrigger asChild>
                <Button
                    className="w-full sm:w-auto"
                    disabled={!isActive || members.length === 0}
                >
                    + Adicionar item
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[92dvh] overflow-hidden">
                <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
                    <div className="flex shrink-0 items-start justify-between gap-4">
                        <DrawerHeader className="items-start">
                            <DrawerTitle className="text-xl sm:text-2xl">
                                Adicionar item
                            </DrawerTitle>
                            <DrawerDescription className="mt-2">
                                Registre um item em {baseCurrency} e escolha
                                como dividir a conta.
                            </DrawerDescription>
                        </DrawerHeader>
                        <DrawerClose asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Fechar"
                            >
                                <XIcon
                                    size={20}
                                    weight="regular"
                                />
                            </Button>
                        </DrawerClose>
                    </div>
                    <form
                        className="flex p-4 min-h-0 flex-1 flex-col"
                        onSubmit={handleSubmit}
                    >
                        <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto">
                            <div className="space-y-5 pt-6">
                                <div>
                                    <label htmlFor="expense-item-name">
                                        Nome do item
                                    </label>
                                    <input
                                        className={inputClassName()}
                                        id="expense-item-name"
                                        maxLength={180}
                                        onChange={(event) =>
                                            setItemName(event.target.value)
                                        }
                                        placeholder="Ex.: Jantar"
                                        required
                                        value={itemName}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="expense-item-amount">
                                        Valor ({baseCurrency})
                                    </label>
                                    <input
                                        className={inputClassName()}
                                        inputMode="decimal"
                                        id="expense-item-amount"
                                        onChange={(event) =>
                                            setAmount(
                                                formatInputAmount(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="0,00"
                                        required
                                        value={amount}
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        O valor é convertido para centavos antes
                                        de ser enviado.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="expense-item-payer">
                                        Quem pagou?
                                    </label>
                                    <select
                                        className={inputClassName()}
                                        id="expense-item-payer"
                                        onChange={(event) =>
                                            setPayerMemberId(event.target.value)
                                        }
                                        value={payerMemberId}
                                    >
                                        {members.map((member) => (
                                            <option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.displayName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <fieldset>
                                    <legend>Quem divide este item?</legend>
                                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                        {members.map((member) => (
                                            <label
                                                className="flex min-h-11 items-center gap-3 rounded-md border border-border px-3"
                                                key={member.id}
                                            >
                                                <input
                                                    checked={selectedMemberIds.includes(
                                                        member.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleMember(member.id)
                                                    }
                                                    type="checkbox"
                                                />
                                                <span>
                                                    {member.displayName}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                <div>
                                    <label htmlFor="expense-split-type">
                                        Forma de divisão
                                    </label>
                                    <select
                                        className={inputClassName()}
                                        id="expense-split-type"
                                        onChange={(event) =>
                                            setSplitType(
                                                event.target.value as SplitType,
                                            )
                                        }
                                        value={splitType}
                                    >
                                        <option value="EQUAL">
                                            {splitLabel("EQUAL")}
                                        </option>
                                        <option value="PERCENTAGE">
                                            {splitLabel("PERCENTAGE")}
                                        </option>
                                        <option value="CUSTOM">
                                            {splitLabel("CUSTOM")}
                                        </option>
                                    </select>
                                </div>

                                {splitType !== "EQUAL" ? (
                                    <fieldset>
                                        <legend>
                                            {splitType === "PERCENTAGE"
                                                ? "Percentual de cada pessoa"
                                                : `Valor de cada pessoa (${baseCurrency})`}
                                        </legend>
                                        <div className="mt-2 space-y-2">
                                            {selectedMembers.map((member) => (
                                                <div
                                                    className="flex items-center gap-3"
                                                    key={member.id}
                                                >
                                                    <label
                                                        className="min-w-0 flex-1 truncate"
                                                        htmlFor={`allocation-${member.id}`}
                                                    >
                                                        {member.displayName}
                                                    </label>
                                                    <input
                                                        className="h-10 w-32 rounded-md border border-input bg-background px-3 text-right text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        id={`allocation-${member.id}`}
                                                        inputMode="decimal"
                                                        onChange={(event) => {
                                                            const value =
                                                                formatInputAmount(
                                                                    event.target
                                                                        .value,
                                                                );
                                                            if (
                                                                splitType ===
                                                                "PERCENTAGE"
                                                            ) {
                                                                setPercentages(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        [member.id]:
                                                                            value,
                                                                    }),
                                                                );
                                                            } else {
                                                                setCustomAmounts(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        [member.id]:
                                                                            value,
                                                                    }),
                                                                );
                                                            }
                                                        }}
                                                        placeholder="0"
                                                        value={
                                                            splitType ===
                                                            "PERCENTAGE"
                                                                ? (percentages[
                                                                      member.id
                                                                  ] ?? "")
                                                                : (customAmounts[
                                                                      member.id
                                                                  ] ?? "")
                                                        }
                                                    />
                                                    <span className="w-8 text-sm text-muted-foreground">
                                                        {splitType ===
                                                        "PERCENTAGE"
                                                            ? "%"
                                                            : ""}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </fieldset>
                                ) : null}

                                {error ? (
                                    <p
                                        className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                                        role="alert"
                                    >
                                        {error}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <DrawerFooter className="mt-6 shrink-0 flex-col-reverse gap-3 p-0 sm:flex-row sm:justify-end">
                            <DrawerClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                >
                                    Cancelar
                                </Button>
                            </DrawerClose>
                            <Button
                                disabled={isPending}
                                type="submit"
                            >
                                {isPending
                                    ? "Adicionando..."
                                    : "Adicionar item"}
                            </Button>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
