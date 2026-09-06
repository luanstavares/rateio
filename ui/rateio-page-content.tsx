"use client";

import Link from "next/link";
import { CrownIcon } from "@phosphor-icons/react";

import { formatMinorAmount } from "../lib/format";
import { useRateio } from "./rateio-provider";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import ManualExpenseDrawer from "./manual-expense-drawer";
import RateioActivityDrawer from "./rateio-activity-drawer";
import RateioMemberManagementDrawer from "./rateio-member-management-drawer";
import RateioRealtimeSession from "./rateio-realtime-session";
import RateioShareLinkDrawer from "./rateio-share-link-drawer";
import RateioStatusControl from "./rateio-status-control";

interface RateioPageContentProps {
    claimStatus?: string;
    authError?: boolean;
}

function claimReturnHref(rateioId: string): string {
    const returnTo = encodeURIComponent(`/rateios/${rateioId}`);
    return `/api/auth/google?returnTo=${returnTo}`;
}

function countLabel(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

export default function RateioPageContent({
    claimStatus,
    authError = false,
}: RateioPageContentProps) {
    const { data } = useRateio();
    const { rateio, members, currentMemberId, currentRole } = data;
    const currentMember = members.find(
        (member) => member.id === currentMemberId,
    );
    const isOwner = currentRole === "OWNER";
    const isActive = rateio.status === "ACTIVE";

    if (data.mode === "anonymous") {
        return (
            <section className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-10 sm:py-12">
                <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                                Sessão compartilhada
                            </p>
                            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                                {rateio.title}
                            </h1>
                            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                                {rateio.description ?? "Sem descrição"}
                            </p>
                        </div>
                        <p className="shrink-0 text-sm text-muted-foreground">
                            {rateio.baseCurrency}
                        </p>
                    </div>

                    <div className="mt-6 rounded-md border border-border p-4">
                        <p className="text-sm text-muted-foreground">
                            Você entrou como
                        </p>
                        <p className="mt-1 font-semibold">
                            {currentMember?.displayName ?? "Participante"}
                        </p>
                    </div>

                    {authError ? (
                        <div
                            className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
                            role="alert"
                        >
                            Não foi possível entrar com o Google agora. Sua
                            sessão compartilhada continua disponível.
                        </div>
                    ) : null}

                    <div className="mt-4 rounded-md border border-border bg-primary/5 p-4">
                        <p className="text-sm text-muted-foreground">
                            Quer guardar sua participação e este histórico na
                            sua conta?
                        </p>
                        <Button
                            asChild
                            className="mt-4"
                            variant="outline"
                        >
                            <a href={claimReturnHref(rateio.id)}>
                                Vincular à minha conta Google
                            </a>
                        </Button>
                    </div>

                    {!isActive ? (
                        <div className="mt-4 rounded-md border border-muted-foreground/40 bg-muted/40 p-4 text-sm text-muted-foreground">
                            Este rateio está fechado para novas alterações.
                        </div>
                    ) : null}
                </div>

                <RateioRealtimeSession />
                <div className="mt-6 flex justify-end">
                    <ManualExpenseDrawer
                        baseCurrency={rateio.baseCurrency}
                        isActive={isActive}
                        members={members.map((member) => ({
                            id: member.id,
                            displayName: member.displayName,
                        }))}
                        rateioId={rateio.id}
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-10 sm:py-12">
            <div className="mb-6">
                <Button
                    asChild
                    variant="ghost"
                    className="-ml-4"
                >
                    <Link href="/rateios">← Meus rateios</Link>
                </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
                {claimStatus === "success" ? (
                    <div
                        className="mb-6 rounded-md border border-primary/40 bg-primary/5 p-4 text-sm text-primary"
                        role="status"
                    >
                        Sua participação anônima foi vinculada à sua conta. Este
                        rateio agora faz parte do seu histórico.
                    </div>
                ) : null}
                {claimStatus === "error" ? (
                    <div
                        className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
                        role="alert"
                    >
                        Não foi possível vincular sua participação anônima à
                        conta. Sua sessão compartilhada não foi alterada; você
                        pode tentar novamente.
                        <a
                            className="mt-2 block font-medium underline underline-offset-4"
                            href={claimReturnHref(rateio.id)}
                        >
                            Tentar vincular novamente
                        </a>
                    </div>
                ) : null}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            {isActive ? (
                                <Badge variant="success">Ativo</Badge>
                            ) : (
                                <Badge variant="secondary">Fechado</Badge>
                            )}
                            {isOwner ? (
                                <Badge variant="outline">
                                    <CrownIcon /> Owner
                                </Badge>
                            ) : null}
                        </div>
                        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                            {rateio.title}
                        </h1>
                        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                            {rateio.description ?? "Sem descrição"}
                        </p>
                    </div>
                    <p className="shrink-0 text-sm text-muted-foreground">
                        {rateio.baseCurrency}
                    </p>
                </div>

                {!isActive ? (
                    <div className="mt-6 rounded-md border border-muted-foreground/40 bg-muted/40 p-4 text-sm text-muted-foreground">
                        Este rateio está fechado para novas alterações.
                    </div>
                ) : null}

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-md border border-border p-4">
                        <p className="text-xs text-muted-foreground">
                            Total registrado
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {formatMinorAmount(data.totalAmountMinor)}
                        </p>
                    </div>
                    <div className="rounded-md border border-border p-4">
                        <p className="text-xs text-muted-foreground">
                            Participantes
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {countLabel(members.length, "membro", "membros")}
                        </p>
                    </div>
                    <div className="rounded-md border border-border p-4">
                        <p className="text-xs text-muted-foreground">
                            Despesas
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {countLabel(data.expenses.length, "despesa", "despesas")}
                        </p>
                    </div>
                </div>

                {isOwner && currentMember ? (
                    <>
                        <RateioStatusControl
                            status={rateio.status}
                        />
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <RateioShareLinkDrawer rateioId={rateio.id} />
                            <RateioMemberManagementDrawer
                                currentMemberId={currentMember.id}
                                currentRole={currentMember.role}
                                members={members}
                            />
                            <RateioActivityDrawer
                                events={data.activityEvents}
                            />
                        </div>
                    </>
                ) : null}
                {!isOwner && currentMember ? (
                    <RateioMemberManagementDrawer
                        currentMemberId={currentMember.id}
                        currentRole={currentMember.role}
                        members={members}
                    />
                ) : null}
                {!isOwner &&
                currentMember &&
                (currentMember.role === "OWNER" ||
                    currentMember.role === "ADMIN") ? (
                    <RateioActivityDrawer events={data.activityEvents} />
                ) : null}
            </div>

            <RateioRealtimeSession />
            <div className="mt-6 flex justify-end">
                <ManualExpenseDrawer
                    baseCurrency={rateio.baseCurrency}
                    isActive={isActive}
                    members={members.map((member) => ({
                        id: member.id,
                        displayName: member.displayName,
                    }))}
                    rateioId={rateio.id}
                />
            </div>
        </section>
    );
}
