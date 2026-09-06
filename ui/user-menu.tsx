"use client";

import { GoogleLogoIcon, UserIcon } from "@phosphor-icons/react";
import Link from "next/link";
import AccountAvatar, { type AccountProfile } from "./account-avatar";
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
import SignOutButton from "./sign-out-button";

interface UserMenuProps {
    profile: AccountProfile | null;
}

export default function UserMenu({ profile }: UserMenuProps) {
    return (
        <Drawer direction="right">
            <DrawerTrigger className="hover:cursor-pointer">
                {profile ? (
                    <AccountAvatar
                        profile={profile}
                        className="size-8"
                    />
                ) : (
                    <UserIcon aria-hidden="true" />
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Minha conta</DrawerTitle>
                    <DrawerDescription>
                        {profile
                            ? "Seu perfil do Google e acesso à conta."
                            : "Entre com o Google para criar e gerenciar seus rateios."}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                    {profile ? (
                        <>
                            <div className="flex min-w-0 items-center gap-3 py-2">
                                <AccountAvatar profile={profile} />
                                <div className="min-w-0">
                                    <p className="wrap-anywhere font-medium">
                                        {profile.name?.trim() || "Sua conta"}
                                    </p>
                                    <p className="wrap-anywhere text-sm text-muted-foreground">
                                        {profile.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col py-2 gap-2">
                                <DrawerClose asChild>
                                    <Button asChild>
                                        <Link href="/conta">
                                            Ver minha conta
                                        </Link>
                                    </Button>
                                </DrawerClose>
                                <SignOutButton />
                            </div>
                        </>
                    ) : (
                        <Button className="w-full">
                            <GoogleLogoIcon />
                            <Link href="/api/auth/google">
                                Entrar com Google
                            </Link>
                        </Button>
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
