import "../ui/globals.css";

import Layout from "../ui/main-layout";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Rate.io",
  description: "Divida a conta com clareza entre amigos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-background text-foreground">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
