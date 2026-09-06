import Link from 'next/link';

import { Button } from './components/ui/button';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-6.25rem)] w-full max-w-xl flex-col items-center justify-center px-6 py-10 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
        Em breve
      </p>
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </section>
  );
}
