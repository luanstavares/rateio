"use client";

import { useState } from "react";

import { ClockUserIcon } from "@phosphor-icons/react";
import type { RateioSessionActivityEvent } from "../lib/rateio/session-data";
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

interface RateioActivityDrawerProps {
    events: RateioSessionActivityEvent[];
}

function payloadString(
    payload: Record<string, unknown>,
    key: string,
): string | null {
    const value = payload[key];
    return typeof value === "string" && value.trim() ? value : null;
}

function eventDescription(event: RateioSessionActivityEvent): string {
    const itemName = payloadString(event.payload, "name");
    const memberName = payloadString(event.payload, "displayName");
    const role = payloadString(event.payload, "role");

    switch (event.type) {
        case "ITEM_DELETED":
            return `Item removido: ${itemName ?? "item sem nome"}`;
        case "MEMBER_REMOVED":
            return `Participante removido: ${memberName ?? "participante"}`;
        case "MEMBER_ROLE_CHANGED":
            return `Papel atualizado: ${role === "ADMIN" ? "administrador" : "participante"}`;
        case "RATEIO_ARCHIVED":
            return "Rateio arquivado";
        case "RATEIO_CLOSED":
            return "Rateio fechado";
        case "RATEIO_REOPENED":
            return "Rateio reaberto";
        case "MEMBER_JOINED":
            return "Novo participante entrou";
        case "EXPENSE_CREATED":
            return "Despesa adicionada";
        case "EXPENSE_REVERSED":
            return "Despesa revertida";
        case "RATEIO_CREATED":
            return "Rateio criado";
        default:
            return "Atividade registrada";
    }
}

function eventDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data indisponível";
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

export default function RateioActivityDrawer({
    events,
}: RateioActivityDrawerProps) {
    const [open, setOpen] = useState(false);

    return (
        <Drawer
            open={open}
            onOpenChange={setOpen}
        >
            <DrawerTrigger asChild>
                <Button
                    className="w-full sm:w-auto"
                    type="button"
                    variant="outline"
                >
                    <ClockUserIcon />
                    Histórico de atividades
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh] p-0">
                <DrawerHeader>
                    <DrawerTitle>Histórico de atividades</DrawerTitle>
                    <DrawerDescription>
                        Acompanhe alterações importantes deste rateio.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4">
                    {events.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Nenhuma atividade registrada.
                        </p>
                    ) : (
                        <ol
                            className="space-y-3 pb-4"
                            aria-label="Atividades do rateio"
                        >
                            {events.map((event) => (
                                <li
                                    className="rounded-md border border-border p-3"
                                    key={event.id}
                                >
                                    <p className="font-medium">
                                        {eventDescription(event)}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {eventDate(event.createdAt)}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button
                            type="button"
                            variant="ghost"
                        >
                            Fechar
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
