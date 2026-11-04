import Navbar from './navbar';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh overflow-x-clip">
      <Navbar />
      <main className="min-h-[calc(100dvh-6.25rem)]">{children}</main>
    </div>
  );
}
