import "../ui/globals.css";

import Layout from "../ui/main-layout";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body suppressHydrationWarning className="bg-background text-foreground">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
