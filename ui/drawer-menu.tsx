"use client";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "./components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "./components/ui/drawer";

type DrawerMenuProps = {
  anchor: "left" | "right";
  content: ReactNode;
  icon: ReactNode;
};

export default function DrawerMenu({ anchor, content, icon }: DrawerMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer
      direction={anchor}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button
          aria-label={anchor === "left" ? "Abrir menu" : "Abrir usuário"}
          size="icon"
          variant="ghost"
        >
          {icon}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-0">
        <DrawerTitle className="sr-only">
          {anchor === "left" ? "Menu" : "Usuário"}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          {anchor === "left"
            ? "Navegação principal do Rate.io"
            : "Opções da conta do Rate.io"}
        </DrawerDescription>
        <div
          className="min-h-full w-full p-6"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
