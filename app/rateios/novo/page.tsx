import Link from "next/link";

import RateioForm from "../../../ui/rateio-form";
import { Button } from "../../../ui/components/ui/button";

export default function NewRateioPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-8 sm:px-10 sm:py-12">
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
          Comece agora
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Novo rateio</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Crie uma conta compartilhada e convide seus amigos depois.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
        <RateioForm />
      </div>

      <Button asChild variant="ghost" className="mt-4">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </section>
  );
}
