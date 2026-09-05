import Link from "next/link";
import { getCurrentUser } from "../../lib/auth/server-session";
import AccountAvatar from "../../ui/account-avatar";
import { Button } from "../../ui/components/ui/button";
import SignOutButton from "../../ui/sign-out-button";

export default async function AccountPage() {
  const user = await getCurrentUser();
  return (
    <section className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="text-3xl font-bold">Minha conta</h1>
      {user ? (
        <div className="mt-6 space-y-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
          <AccountAvatar profile={{ name: user.name, email: user.email, pictureUrl: user.pictureUrl }} className="size-16" />
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">Nome</dt>
              <dd className="wrap-anywhere font-medium">{user.name?.trim() || "Não informado"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">E-mail</dt>
              <dd className="wrap-anywhere font-medium">{user.email}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            Estes dados são fornecidos pelo Google. A edição de preferências ainda não está disponível.
          </p>
          <SignOutButton />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <p className="text-muted-foreground">Entre com o Google para acessar sua conta.</p>
          <Button asChild><a href="/api/auth/google">Entrar com Google</a></Button>
        </div>
      )}
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </section>
  );
}
