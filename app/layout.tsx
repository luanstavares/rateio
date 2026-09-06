import '../ui/globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getUserSession } from '../lib/auth/user-session-server';
import Layout from '../ui/main-layout';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Rate.io',
  description: 'Divida a conta com clareza entre amigos.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initialUser = await getUserSession();

  return (
    <html suppressHydrationWarning lang="pt-BR">
      <body className="bg-background text-foreground">
        <Providers initialUser={initialUser}>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
