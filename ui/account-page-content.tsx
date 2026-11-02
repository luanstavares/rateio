'use client';

import Link from 'next/link';
import AccountAvatar from './account-avatar';
import { Button } from './components/ui/button';
import GoogleSignInLink from './google-sign-in-link';
import SignOutButton from './sign-out-button';
import { useUser } from './user-provider';

export default function AccountPageContent() {
  const { user } = useUser();

  return (
    <>
      {user ? (
        <div className="mt-6 space-y-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
          <AccountAvatar
            profile={{
              name: user.name,
              email: user.email,
              pictureUrl: user.pictureUrl,
            }}
            className="size-16"
          />
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">Nome</dt>
              <dd className="wrap-anywhere font-medium">
                {user.name?.trim() || 'Não informado'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">E-mail</dt>
              <dd className="wrap-anywhere font-medium">{user.email}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            Estes dados são fornecidos pelo Google. A edição de preferências
            ainda não está disponível.
          </p>
          <SignOutButton />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <p className="text-muted-foreground">
            Entre com o Google para acessar sua conta.
          </p>
          <Button asChild>
            <GoogleSignInLink>Entrar com Google</GoogleSignInLink>
          </Button>
        </div>
      )}
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </>
  );
}
