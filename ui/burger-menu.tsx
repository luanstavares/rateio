"use client";

import { ListIcon } from "@phosphor-icons/react";

import DrawerMenu from "./drawer-menu";

export default function BurgerMenu() {
    return (
        <DrawerMenu
            anchor="left"
            icon={<ListIcon aria-hidden="true" />}
        />
    );
}
