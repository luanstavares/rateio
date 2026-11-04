import Link from 'next/link';

import { ArchiveBoxIcon, ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';
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

export default function RateioCard({ rateio }: RateioCardProps) {
  const description = descriptionText(rateio.description);
  const isActive = rateio.status === 'ACTIVE';

  return (
    <Link
      href={`/rateios/${rateio.id}`}
      className="rateio-card-outline group relative flex min-h-64 flex-col rounded-2xl border border-border bg-secondary p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-3">
        {isActive ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="secondary">Fechado</Badge>
        )}
        {isActive ? (
          <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
            <ArrowRightIcon />
          </span>
        ) : (
          <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
            <ArchiveBoxIcon />
          </span>
        )}
      </div>
      <h2 className="mt-5 line-clamp-2 break-words text-xl font-semibold">
        {rateio.title}
      </h2>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {description ?? 'Sem descrição'}
      </p>
      <div className="mt-auto pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5">
          <div>
            <p className="text-xs text-muted-foreground">Total registrado</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
              {formatMinorAmount(rateio.totalAmountMinor)}
            </p>
          </div>
          <div
            className="flex shrink-0 items-center -space-x-2"
            role="group"
            aria-label={`${rateio.members.length} ${rateio.members.length === 1 ? 'participante' : 'participantes'}: ${rateio.members.map((member) => participantProfile(member).displayName).join(', ')}`}
          >
            {rateio.members.slice(0, 3).map((member) => (
              <ParticipantAvatar
                key={member.id}
                {...participantProfile(member)}
                className="border-2 border-secondary"
              />
            ))}
            {rateio.members.length > 3 ? (
              <span
                className="relative flex size-8 items-center justify-center rounded-full border-2 border-secondary bg-muted text-[10px] font-medium text-foreground"
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
      </div>
    </Link>
  );
}
