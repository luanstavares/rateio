"use client";

import { ListIcon } from "@phosphor-icons/react";

import DrawerMenu from "./drawer-menu";
import MenuList from "./menu-list";

export default function BurgerMenu() {
  return (
    <DrawerMenu
      anchor="left"
      content={<MenuList />}
      icon={<ListIcon aria-hidden="true" />}
    />
  );
}
