import Link from "next/link";

import RateioJoinForm from "../../../ui/rateio-join-form";
import { Button } from "../../../ui/components/ui/button";

type JoinRateioPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function JoinRateioPage({
  searchParams,
}: JoinRateioPageProps) {
  const params = await searchParams;
  const initialToken = typeof params.token === "string" ? params.token : "";

  return (
    <section className="mx-auto w-full max-w-xl px-6 py-8 sm:px-10 sm:py-12">
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
          Convite compartilhado
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Entrar em rateio</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Informe seu nome para acompanhar este rateio sem precisar criar uma
          conta.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
        <RateioJoinForm initialToken={initialToken} />
      </div>

      <Button asChild variant="ghost" className="mt-4">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </section>
  );
}
