"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { UsersThreeIcon } from "@phosphor-icons/react";
import {
    changeRateioMemberRole,
    removeRateioMember,
    type ChangeMemberRoleResult,
    type RemoveMemberResult,
} from "../app/actions/rateios";
import type { RateioMemberResponseDto } from "../lib/api/generated";
import type { MembershipRole } from "../lib/api/rateios";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
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

interface RateioMemberManagementDrawerProps {
    rateioId: string;
    members: RateioMemberResponseDto[];
    currentMemberId: string;
    currentRole: MembershipRole;
}

function memberName(member: RateioMemberResponseDto): string {
    return (
        optionalString(member.user?.name) ??
        optionalString(member.user?.email) ??
        "Participante"
    );
}

function optionalString(value: unknown): string | null {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .map((part) => part[0])
        .filter((initial): initial is string => initial !== undefined)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function roleLabel(role: MembershipRole): string {
    switch (role) {
        case "OWNER":
            return "Responsável";
        case "ADMIN":
            return "Administrador";
        default:
            return "Participante";
    }
}

export default function RateioMemberManagementDrawer({
    rateioId,
    members,
    currentMemberId,
    currentRole,
}: RateioMemberManagementDrawerProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const canManage = currentRole === "OWNER" || currentRole === "ADMIN";
    const canChangeRoles = currentRole === "OWNER";

    function refreshAfter(result: ChangeMemberRoleResult | RemoveMemberResult) {
        if (!result.success) {
            setError(result.error);
            return;
        }
        setError(null);
        router.refresh();
    }

    function handleRoleChange(memberId: string, role: MembershipRole) {
        setError(null);
        startTransition(async () => {
            const result = await changeRateioMemberRole(
                rateioId,
                memberId,
                role,
            );
            refreshAfter(result);
        });
    }

    function handleRemove(member: RateioMemberResponseDto) {
        if (!window.confirm(`Remover ${memberName(member)} deste rateio?`))
            return;

        setError(null);
        startTransition(async () => {
            const result: RemoveMemberResult = await removeRateioMember(
                rateioId,
                member.id,
            );
            refreshAfter(result);
        });
    }

    function canRemove(member: RateioMemberResponseDto): boolean {
        if (member.id === currentMemberId || member.role === "OWNER")
            return false;
        return currentRole === "OWNER" || member.role === "PARTICIPANT";
    }

    return (
        <Drawer
            open={open}
            onOpenChange={setOpen}
        >
            <DrawerTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                >
                    <UsersThreeIcon />
                    Gerenciar participantes
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh] p-0">
                <DrawerHeader>
                    <DrawerTitle>Participantes</DrawerTitle>
                    <DrawerDescription>
                        Veja quem participa deste rateio e os papéis de cada
                        pessoa.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4">
                    {error ? (
                        <div
                            className="mb-4 rounded-md border border-destructive/50 p-3 text-sm text-destructive"
                            role="alert"
                        >
                            {error}
                        </div>
                    ) : null}

                    {members.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Nenhum participante ativo encontrado.
                        </p>
                    ) : (
                        <ul className="space-y-3 pb-4">
                            {members.map((member) => {
                                const name = memberName(member);
                                const pictureUrl = optionalString(
                                    member.user?.pictureUrl,
                                );
                                const isSelf = member.id === currentMemberId;
                                return (
                                    <li
                                        key={member.id}
                                        className="rounded-md border border-border p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10">
                                                {pictureUrl ? (
                                                    <AvatarImage
                                                        alt={name}
                                                        src={pictureUrl}
                                                    />
                                                ) : null}
                                                <AvatarFallback>
                                                    {initials(name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {name}
                                                    {isSelf ? " (você)" : ""}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {roleLabel(member.role)}
                                                </p>
                                            </div>
                                        </div>

                                        {canManage &&
                                        (canChangeRoles ||
                                            canRemove(member)) ? (
                                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                                {canChangeRoles &&
                                                !isSelf &&
                                                member.role !== "OWNER" ? (
                                                    <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                                                        <span className="sr-only">
                                                            Papel de {name}
                                                        </span>
                                                        <select
                                                            aria-label={`Papel de ${name}`}
                                                            className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                            disabled={isPending}
                                                            onChange={(event) =>
                                                                handleRoleChange(
                                                                    member.id,
                                                                    event.target
                                                                        .value as MembershipRole,
                                                                )
                                                            }
                                                            value={member.role}
                                                        >
                                                            <option value="ADMIN">
                                                                Administrador
                                                            </option>
                                                            <option value="PARTICIPANT">
                                                                Participante
                                                            </option>
                                                        </select>
                                                    </label>
                                                ) : null}
                                                {canRemove(member) ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        disabled={isPending}
                                                        onClick={() =>
                                                            handleRemove(member)
                                                        }
                                                    >
                                                        Remover
                                                    </Button>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <DrawerFooter>
                    {isPending ? (
                        <p
                            aria-live="polite"
                            className="text-sm text-muted-foreground"
                        >
                            Salvando alteração...
                        </p>
                    ) : null}
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
