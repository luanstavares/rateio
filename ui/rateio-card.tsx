import Link from 'next/link';

import type { RateioListItemResponseDto } from '../lib/api/generated';
import { formatMinorAmount } from '../lib/format';
import { participantProfile } from '../lib/rateio/participant-profile';
import { Badge } from './components/ui/badge';
import ParticipantAvatar from './participant-avatar';

interface RateioCardProps {
  rateio: RateioListItemResponseDto;
}

function descriptionText(
  description: RateioListItemResponseDto['description'],
) {
  return typeof description === 'string' ? description : null;
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export default function RateioCard({ rateio }: RateioCardProps) {
  const description = descriptionText(rateio.description);
  const isActive = rateio.status === 'ACTIVE';

  return (
    <Link
      href={`/rateios/${rateio.id}`}
      className="group flex min-h-52 flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-3">
        {isActive ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="secondary">Fechado</Badge>
        )}
        <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
          <ArrowRightIcon />
        </span>
      </div>
      <h2 className="mt-5 line-clamp-2 text-xl font-semibold">
        {rateio.title}
      </h2>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {description ?? 'Sem descrição'}
      </p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div>
          <p className="text-xs text-muted-foreground">Total registrado</p>
          <p className="mt-1 text-lg font-semibold">
            {formatMinorAmount(rateio.totalAmountMinor)}
          </p>
        </div>
        <div
          className="flex shrink-0 items-center -space-x-2"
          role="img"
          aria-label={`${rateio.members.length} ${rateio.members.length === 1 ? 'participante' : 'participantes'}: ${rateio.members.map((member) => participantProfile(member).displayName).join(', ')}`}
        >
          {rateio.members.slice(0, 3).map((member) => (
            <ParticipantAvatar
              key={member.id}
              {...participantProfile(member)}
              className="border-2 border-background"
            />
          ))}
          {rateio.members.length > 3 ? (
            <span
              className="relative flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-foreground"
              aria-hidden="true"
            >
              +{rateio.members.length - 3}
            </span>
          ) : null}
          {rateio.members.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              0 participantes
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
