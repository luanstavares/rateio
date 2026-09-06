import "../ui/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Layout from "../ui/main-layout";
import Providers from "./providers";

export const metadata: Metadata = {
    title: "Rate.io",
    description: "Divida a conta com clareza entre amigos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html
            suppressHydrationWarning
            lang="pt-BR"
        >
            <body className="bg-background text-foreground">
                <Providers>
                    <Layout>{children}</Layout>
                </Providers>
            </body>
        </html>
    );
}
