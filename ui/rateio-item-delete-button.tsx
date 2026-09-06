"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./components/ui/alert-dialog";
import {
    removeExpenseItem,
    type RemoveExpenseItemResult,
} from "../app/actions/expenses";
import { Button } from "./components/ui/button";

interface RateioItemDeleteButtonProps {
    rateioId: string;
    expenseId: string;
    itemId: string;
    itemName: string;
    createdByMemberId: string;
    currentMemberId: string;
    currentRole: "OWNER" | "ADMIN" | "PARTICIPANT";
}

export default function RateioItemDeleteButton({
    rateioId,
    expenseId,
    itemId,
    itemName,
    createdByMemberId,
    currentMemberId,
    currentRole,
}: RateioItemDeleteButtonProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const canDelete =
        currentRole === "OWNER" ||
        currentRole === "ADMIN" ||
        createdByMemberId === currentMemberId;

    if (!canDelete) return null;

    function handleDelete() {
        setError(null);
        startTransition(async () => {
            const result: RemoveExpenseItemResult = await removeExpenseItem(
                rateioId,
                expenseId,
                itemId,
            );
            if (!result.success) {
                setError(result.error);
                return;
            }
            router.refresh();
        });
    }

    return (
        <div className="flex flex-col items-end">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        aria-label={`Remover item ${itemName}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isPending}
                        size="icon"
                        type="button"
                        variant="ghost"
                    >
                        <TrashIcon aria-hidden="true" />
                    </Button>
                </AlertDialogTrigger>
                {error ? (
                    <span
                        className="mt-1 max-w-36 text-right text-xs text-destructive"
                        role="alert"
                    >
                        {error}
                    </span>
                ) : null}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            O item “{itemName}” será removido dos cálculos deste
                            rateio. O histórico da alteração será preservado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            variant="ghost"
                            disabled={isPending}
                        >
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isPending}
                            onClick={handleDelete}
                            variant="destructive"
                        >
                            {isPending ? "Removendo..." : "Remover item"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
