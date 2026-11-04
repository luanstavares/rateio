'use client';

import {
  CheckIcon,
  ForkKnifeIcon,
  HouseIcon,
  AirplaneTiltIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';

const EXAMPLES = [
  {
    label: 'Churrasco',
    title: 'Churrasco de domingo',
    icon: ForkKnifeIcon,
    items: [
      ['Comida', '160,00'],
      ['Bebidas', '60,00'],
      ['Carvão e gelo', '20,00'],
    ],
    total: '240,00',
    share: '60,00',
  },
  {
    label: 'Viagem',
    title: 'Fim de semana na praia',
    icon: AirplaneTiltIcon,
    items: [
      ['Hospedagem', '800,00'],
      ['Mercado', '280,00'],
      ['Combustível', '120,00'],
    ],
    total: '1.200,00',
    share: '300,00',
  },
  {
    label: 'Casa',
    title: 'Nosso cantinho',
    icon: HouseIcon,
    items: [
      ['Mercado', '400,00'],
      ['Internet', '120,00'],
      ['Produtos de limpeza', '80,00'],
    ],
    total: '600,00',
    share: '150,00',
  },
] as const;

export function FriendAvatars({ paper = false }: { paper?: boolean }) {
  return (
    <div className="flex -space-x-2" aria-label="Ana, Bruno, Caio e você">
      {['A', 'B', 'C', 'V'].map((name, index) => (
        <span
          key={name}
          className={`flex size-9 items-center justify-center rounded-full border-[3px] text-xs font-semibold ${paper ? 'border-landing-paper' : 'border-background'} ${index === 0 ? 'bg-landing-lilac text-landing-ink' : index === 1 ? 'bg-landing-blue text-landing-ink' : index === 2 ? 'bg-landing-sage text-landing-ink' : 'bg-primary text-primary-foreground'}`}
        >
          {name}
        </span>
      ))}
    </div>
  );
}

export default function SharedReceipt() {
  const [selected, setSelected] = useState(0);
  const example = EXAMPLES[selected];
  const Icon = example.icon;

  return (
    <div className="relative mx-auto w-full max-w-[430px] pb-12 pt-5 sm:pb-14">
      <div
        className="receipt-underlay absolute inset-x-5 bottom-16 top-5 rotate-[6deg] rounded-2xl border border-primary/35 bg-primary/5"
        aria-hidden="true"
      />
      <div className="hero-receipt relative">
        <div className="rounded-t-2xl bg-landing-paper px-5 pb-7 pt-8 text-landing-ink sm:px-9 sm:pt-10">
          <div className="mb-8 flex items-center justify-between">
            <span className="font-logo text-2xl">Rate.io</span>
            <span className="flex items-center gap-1.5 rounded-full border border-landing-ink/15 px-2 py-1 text-[10px] text-landing-paper-muted sm:text-[11px]">
              <span className="size-1.5 rounded-full bg-landing-positive" />{' '}
              Conta compartilhada
            </span>
          </div>
          <div
            className="mb-6 flex gap-1.5"
            aria-label="Escolha um exemplo de rateio"
          >
            {EXAMPLES.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-ink ${selected === index ? 'bg-landing-ink text-landing-paper' : 'text-landing-paper-muted hover:bg-landing-ink/10'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div aria-live="polite" aria-atomic="true">
            <div className="flex items-center gap-3">
              <Icon
                className="size-7 shrink-0 text-landing-paper-muted"
                weight="duotone"
                aria-hidden="true"
              />
              <h2 className="text-[25px] font-semibold leading-tight">
                {example.title}
              </h2>
            </div>
            <div className="mb-6 mt-5 flex items-center justify-between border-b border-dashed border-landing-ink/25 pb-6">
              <FriendAvatars paper />
              <span className="flex items-center gap-1.5 text-xs text-landing-paper-muted">
                <UsersIcon aria-hidden="true" />4 amigos
              </span>
            </div>
            <ul className="space-y-4 text-sm">
              {example.items.map(([name, amount]) => (
                <li key={name} className="flex justify-between gap-4">
                  <span className="text-landing-paper-muted">{name}</span>
                  <span className="shrink-0 tabular-nums">R$ {amount}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-end justify-between gap-3 border-t border-dashed border-landing-ink/25 pt-5">
              <span className="text-sm">Total do encontro</span>
              <span className="shrink-0 text-2xl font-semibold leading-none tracking-tight tabular-nums sm:text-[30px]">
                R$ {example.total}
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between rounded-lg bg-landing-ink/5 px-4 py-3">
              <span className="text-sm text-landing-paper-muted">
                Para cada um
              </span>
              <span className="text-lg font-semibold tabular-nums">
                R$ {example.share}
              </span>
            </div>
          </div>
          <p className="mt-5 text-center text-[11px] text-landing-paper-muted">
            Um exemplo de como a conta fica simples.
          </p>
        </div>
        <svg
          viewBox="0 0 400 15"
          preserveAspectRatio="none"
          className="block h-4 w-full text-landing-paper"
          aria-hidden="true"
        >
          <path
            d="M0 0H400V3L390 13 380 3 370 13 360 3 350 13 340 3 330 13 320 3 310 13 300 3 290 13 280 3 270 13 260 3 250 13 240 3 230 13 220 3 210 13 200 3 190 13 180 3 170 13 160 3 150 13 140 3 130 13 120 3 110 13 100 3 90 13 80 3 70 13 60 3 50 13 40 3 30 13 20 3 10 13 0 3Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="hero-confirmation absolute -bottom-1 -left-2 flex items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3 sm:-left-10 sm:bottom-0 sm:px-5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon weight="bold" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium">Tudo dividido. Tudo certo.</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Agora é só aproveitar.
          </p>
        </div>
      </div>
    </div>
  );
}
