'use client';

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  CheckIcon,
  HeartIcon,
  LinkIcon,
  ScalesIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useRef } from 'react';

import { Button } from '../components/ui/button';
import Logo from '../logo';
import ScrollStory from './scroll-story';
import SharedReceipt from './shared-receipt';
import { useLandingMotion } from './use-landing-motion';

const DETAILS = [
  {
    icon: LinkIcon,
    title: 'O convite é um link.',
    description:
      'Você cria com sua conta Google. Seus amigos podem participar sem cadastro.',
  },
  {
    icon: ScalesIcon,
    title: 'A divisão faz sentido.',
    description:
      'Divida igualmente, por percentual ou com valores personalizados para cada despesa.',
  },
  {
    icon: ArrowsClockwiseIcon,
    title: 'Todo mundo acompanha.',
    description:
      'Despesas e saldos atualizados em tempo real, com histórico para consultar depois.',
  },
];

export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null);
  useLandingMotion(root);

  return (
    <div ref={root} className="relative">
      <section
        className="landing-hero relative px-6 pb-16 pt-8 sm:px-10 lg:pb-20 lg:pt-12"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto grid min-h-[min(730px,calc(100svh-150px))] max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="hero-copy relative z-10 py-6 lg:py-12">
            <p className="mb-7 flex items-center gap-2.5 text-sm text-primary">
              <span className="h-px w-7 bg-primary" aria-hidden="true" />
              Bons amigos. Boas histórias. Conta dividida.
            </p>
            <h1
              id="hero-heading"
              className="max-w-2xl text-[clamp(3rem,5.4vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.055em]"
            >
              A melhor parte
              <br />é estar junto.
            </h1>
            <p className="mt-7 max-w-[390px] text-lg leading-relaxed text-muted-foreground">
              Do churrasco de domingo à próxima viagem, o Rate.io cuida da
              divisão para vocês aproveitarem o momento.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 gap-5 rounded-xl px-6 text-base"
              >
                <Link href="/rateios/novo">
                  Criar um rateio <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <a
                href="#como-funciona"
                className="inline-flex h-12 items-center gap-2 px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                Veja como funciona <ArrowDownIcon aria-hidden="true" />
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Já recebeu um convite?{' '}
              <Link
                href="/rateios/entrar"
                className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
              >
                Entrar em um rateio
              </Link>
            </p>
          </div>
          <div className="relative px-2 sm:px-8 lg:px-0">
            <SharedReceipt />
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-5 border-t border-border pt-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:mt-8">
          <span className="flex items-center gap-2">
            <HeartIcon className="text-primary" aria-hidden="true" />
            Feito para compartilhar a vida.
          </span>
          <a
            href="#como-funciona"
            className="flex items-center gap-3 self-start transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Role e veja a conta se resolver <ArrowDownIcon aria-hidden="true" />
          </a>
        </div>
      </section>

      <ScrollStory />

      <section
        aria-label="O que você encontra no Rate.io"
        className="border-y border-border bg-secondary/45 px-6 py-16 sm:px-10 lg:py-20"
      >
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3 md:gap-10">
          {DETAILS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <Icon
                size={26}
                className="mb-6 text-primary"
                weight="duotone"
                aria-hidden="true"
              />
              <h2 className="text-xl font-medium">{title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="relative overflow-hidden px-6 py-24 text-center sm:px-10 lg:py-32"
        aria-labelledby="start-heading"
      >
        <div className="mx-auto max-w-3xl">
          <span className="mx-auto mb-8 flex size-14 items-center justify-center rounded-full border border-primary/30 text-primary">
            <CheckIcon size={24} aria-hidden="true" />
          </span>
          <h2
            id="start-heading"
            className="text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl"
          >
            O próximo encontro
            <br />
            já pode ter um rateio.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Uma viagem, uma casa ou só uma pizza entre amigos.
            <br className="hidden sm:block" /> Comece pela conta. Fique pelas
            boas histórias.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-9 h-12 gap-6 rounded-xl px-7 text-base"
          >
            <Link href="/rateios/novo">
              Criar meu primeiro rateio <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
          <p className="mt-5 text-xs text-muted-foreground">
            Crie com Google. Convide a turma por link.
          </p>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 border-t border-border px-6 py-8 text-xs text-muted-foreground sm:mx-10 sm:flex-row sm:px-0 lg:mx-auto">
        <Link
          href="/"
          aria-label="Rate.io, início"
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Logo className="text-xl" />
        </Link>
        <p>Dividir a conta também faz parte de estar junto.</p>
        <Link
          href="/rateios"
          className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Meus rateios
        </Link>
      </footer>
    </div>
  );
}
