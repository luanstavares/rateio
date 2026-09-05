"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  changeRateioStatus,
  type ChangeRateioStatusResult,
} from "../app/actions/rateios";
import type { RateioStatus } from "../lib/api/rateios";
import { Button } from "./components/ui/button";

interface RateioStatusControlProps {
  rateioId: string;
  status: RateioStatus;
}

export default function RateioStatusControl({
  rateioId,
  status,
}: RateioStatusControlProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nextStatus: RateioStatus = status === "ACTIVE" ? "CLOSED" : "ACTIVE";
  const actionLabel = status === "ACTIVE" ? "Fechar rateio" : "Reabrir rateio";

  function handleStatusChange() {
    setError(null);
    startTransition(async () => {
      const result: ChangeRateioStatusResult = await changeRateioStatus(
        rateioId,
        nextStatus,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="text-sm text-muted-foreground">
        Como responsável, você pode fechar o rateio quando a conta estiver
        resolvida. Essa ação pode ser revertida.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full sm:w-auto"
        disabled={isPending}
        onClick={handleStatusChange}
      >
        {isPending ? "Salvando..." : actionLabel}
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
