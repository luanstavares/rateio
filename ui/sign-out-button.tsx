'use client';

import { useRouter } from 'next/navigation';
import { Button } from './components/ui/button';
import { useUser } from './user-provider';

export default function SignOutButton() {
  const router = useRouter();
  const { logout, isLoggingOut, logoutError } = useUser();

  async function signOut() {
    if (isLoggingOut) return;
    try {
      await logout();
      router.replace('/');
      router.refresh();
    } catch {
      return;
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoggingOut}
        onClick={signOut}
      >
        {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
      </Button>
      {logoutError && (
        <p role="alert" className="text-sm text-foreground">
          Não foi possível sair. Tente novamente.
        </p>
      )}
    </div>
  );
}
