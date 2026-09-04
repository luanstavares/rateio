"use client";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "./components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";

type DrawerMenuProps = {
  anchor: "left" | "right";
  content: ReactNode;
  icon: ReactNode;
};

export default function DrawerMenu({ anchor, content, icon }: DrawerMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label={anchor === "left" ? "Abrir menu" : "Abrir usuário"}
          size="icon"
          variant="ghost"
        >
          {icon}
        </Button>
      </SheetTrigger>
      <SheetContent side={anchor} className="p-0">
        <SheetTitle className="sr-only">
          {anchor === "left" ? "Menu" : "Usuário"}
        </SheetTitle>
        <div
          className="mt-[10px] w-[250px]"
          role="presentation"
          onClick={() => setOpen(false)}
          onKeyDown={() => setOpen(false)}
        >
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
