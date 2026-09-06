"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { createRateio } from "../app/actions/rateios";
import type { CreateRateioInput } from "../lib/api/rateios";
import { Button } from "./components/ui/button";
import { useUser } from "./user-provider";

export default function RateioForm() {
    const router = useRouter();
    const { isLoggedIn } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const input: CreateRateioInput = {
            title: String(formData.get("title") ?? ""),
            description: String(formData.get("description") ?? "") || undefined,
        };

        setError(null);
        startTransition(async () => {
            const result = await createRateio(input);
            if (!result.success) {
                setError(result.error);
                return;
            }

            router.push(`/rateios/${result.data.id}`);
            router.refresh();
        });
    }

    return (
        <form
            className="space-y-5"
            onSubmit={handleSubmit}
        >
            <div className="space-y-2">
                <label
                    htmlFor="rateio-title"
                    className="text-sm font-medium"
                >
                    Nome do rateio
                </label>
                <input
                    id="rateio-title"
                    name="title"
                    type="text"
                    required
                    maxLength={160}
                    placeholder="Ex.: Viagem de fim de semana"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isPending}
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="rateio-description"
                    className="text-sm font-medium"
                >
                    Descrição{" "}
                    <span className="text-muted-foreground">(opcional)</span>
                </label>
                <textarea
                    id="rateio-description"
                    name="description"
                    maxLength={2000}
                    rows={4}
                    placeholder="Adicione um contexto para o grupo."
                    className="flex min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isPending}
                />
            </div>

            {error ? (
                <p
                    className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}

            <div className="space-y-3">
                <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isPending}
                >
                    {isPending ? "Criando rateio..." : "Criar rateio"}
                </Button>
                {!isLoggedIn && (
                    <p className="text-sm text-muted-foreground">
                        É preciso entrar com o Google para salvar seu rateio.{" "}
                        <a
                            href="/api/auth/google"
                            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                        >
                            Entrar com Google
                        </a>
                    </p>
                )}
            </div>
        </form>
    );
}
