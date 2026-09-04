"use client";

import Navbar from "./navbar";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex h-[calc(100dvh-100px)] flex-col items-center justify-center overflow-hidden">
        {children}
      </main>
    </>
  );
}
