"use client";

import { useState } from "react";

import { TrashIcon } from "@phosphor-icons/react";
import type { RateioStatus } from "../lib/api/rateios";
import { Button } from "./components/ui/button";
import { useRateioMutations } from "./rateio-provider";

interface RateioStatusControlProps {
    status: RateioStatus;
}

export default function RateioStatusControl({
    status,
}: RateioStatusControlProps) {
    const [error, setError] = useState<string | null>(null);
    const { changeStatus } = useRateioMutations();
    const nextStatus: RateioStatus = status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    const actionLabel =
        status === "ACTIVE" ? "Fechar rateio" : "Reabrir rateio";

    async function handleStatusChange() {
        setError(null);
        try {
            const result = await changeStatus.mutateAsync(nextStatus);
            if (!result.success) {
                setError(result.error);
            }
        } catch {
            setError("Não foi possível alterar o status do rateio. Tente novamente.");
        }
    }

    return (
        <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm text-muted-foreground">
                Como responsável, você pode fechar o rateio quando a conta
                estiver resolvida. Essa ação pode ser revertida.
            </p>
            <Button
                type="button"
                variant={status === "ACTIVE" ? "destructive" : "outline"}
                className="mt-4 w-full sm:w-auto"
                disabled={changeStatus.isPending}
                onClick={() => void handleStatusChange()}
            >
                {status === "ACTIVE" && <TrashIcon />}
                {changeStatus.isPending ? "Salvando..." : actionLabel}
            </Button>
            {error ? (
                <p
                    className="mt-3 text-sm text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}
