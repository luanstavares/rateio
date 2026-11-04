import {
  ArrowRightIcon,
  CheckIcon,
  LinkIcon,
  PlusIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';

import { FriendAvatars } from './shared-receipt';

const STEPS = [
  {
    title: 'Junte a turma.',
    description:
      'Crie um rateio e compartilhe o link. Seus amigos entram com um nome, sem precisar criar uma conta.',
  },
  {
    title: 'Cada gasto no seu lugar.',
    description:
      'Alguém comprou a comida? Outro trouxe as bebidas? Registre o valor, quem pagou e quem participa da divisão.',
  },
  {
    title: 'A conta fecha para todos.',
    description:
      'Veja quanto cada pessoa deve ou tem a receber. Os saldos se atualizam em tempo real para todo o grupo.',
  },
];

function InvitePreview() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mb-7 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <UsersIcon size={26} aria-hidden="true" />
      </div>
      <h3 className="text-2xl font-semibold">A turma está chegando.</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Um link. Todo mundo na mesma conta.
      </p>
      <div className="mt-7 flex items-center gap-3 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
        <LinkIcon className="shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate">rate.io/convite/churrasco</span>
        <CheckIcon
          className="ml-auto shrink-0 text-primary"
          aria-hidden="true"
        />
      </div>
      <div className="mt-7 flex items-center gap-4">
        <FriendAvatars />
        <span className="text-sm text-muted-foreground">
          4 amigos no rateio
        </span>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Prévia ilustrativa de um convite
      </p>
    </div>
  );
}

function ExpensesPreview() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Itens da conta</h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
          3 itens
        </span>
      </div>
      <ul className="space-y-3">
        {[
          ['Comida', 'Ana', '160,00'],
          ['Bebidas', 'Bruno', '60,00'],
          ['Carvão e gelo', 'Bruno', '20,00'],
        ].map(([name, payer, value]) => (
          <li
            key={name}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-4"
          >
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pago por {payer}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums">
              R$ {value}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center gap-2 text-sm text-primary">
        <PlusIcon className="shrink-0" aria-hidden="true" /> Cada despesa conta
        uma parte da história.
      </div>
    </div>
  );
}

function BalancesPreview() {
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-sm text-muted-foreground">Total registrado</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-4xl font-semibold tracking-tight tabular-nums">
          R$ 240,00
        </h3>
        <span className="mb-1 text-xs text-muted-foreground">
          R$ 60,00 por pessoa
        </span>
      </div>
      <div className="my-6 border-t border-border" />
      <ul className="space-y-5">
        {[
          ['Ana', 'Recebe', '100,00'],
          ['Bruno', 'Recebe', '20,00'],
          ['Caio', 'Deve', '60,00'],
          ['Você', 'Deve', '60,00'],
        ].map(([name, status, value]) => (
          <li key={name} className="flex items-center justify-between">
            <span className="text-sm">{name}</span>
            <span
              className={`flex items-center gap-3 text-sm ${status === 'Recebe' ? 'text-landing-sage' : 'text-primary'}`}
            >
              <span className="text-xs">{status}</span>
              <span className="w-22 text-right font-medium tabular-nums">
                R$ {value}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-7 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-landing-sage" />
        Todo mundo vê a mesma conta.
      </div>
    </div>
  );
}

const PREVIEWS = [InvitePreview, ExpensesPreview, BalancesPreview];

export default function ScrollStory() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="story-heading"
      className="scroll-mt-8 px-6 py-20 sm:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-4xl lg:mb-2">
          <p className="mb-5 text-sm text-primary">
            Da primeira mensagem ao último acerto
          </p>
          <h2
            id="story-heading"
            className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Menos “quem pagou?”
            <br />
            Mais “quando é o próximo?”
          </h2>
        </div>
        <div className="story-track relative grid gap-8 lg:grid-cols-2 lg:gap-24">
          <div className="relative">
            <div
              className="absolute bottom-24 left-[15px] top-24 hidden w-px bg-border lg:block"
              aria-hidden="true"
            >
              <div className="story-progress h-full origin-top bg-primary" />
            </div>
            {STEPS.map((step, index) => {
              const Preview = PREVIEWS[index];
              return (
                <div
                  className="story-step relative py-10 lg:flex lg:min-h-[65vh] lg:items-center lg:py-24"
                  key={step.title}
                >
                  <div className="flex gap-6">
                    <span className="relative z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background text-xs text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-2xl font-medium sm:text-3xl">
                        {step.title}
                      </h3>
                      <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {step.description}
                      </p>
                      {index === 2 ? (
                        <Link
                          href="/rateios/novo"
                          className="mt-6 inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                        >
                          Criar meu primeiro rateio{' '}
                          <ArrowRightIcon aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-8 rounded-2xl border border-border bg-secondary p-6 lg:hidden">
                    <Preview />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-[18vh] py-10">
              <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                Churrasco de domingo
                <span className="ml-auto">Exemplo de rateio</span>
              </div>
              <div className="relative h-[430px] rounded-2xl border border-border bg-secondary">
                <div
                  className="absolute inset-x-6 top-0 h-px bg-primary/60"
                  aria-hidden="true"
                />
                {PREVIEWS.map((Preview, index) => (
                  <div
                    key={index}
                    data-story-panel={index}
                    className={`story-panel absolute inset-0 p-8 ${index === 2 ? '' : 'invisible'}`}
                  >
                    <Preview />
                  </div>
                ))}
              </div>
              <p className="mt-5 text-center text-xs text-muted-foreground">
                Continue rolando para acompanhar a conta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
