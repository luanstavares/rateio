import Link from "next/link";

import type { RateioListItemResponseDto } from "../lib/api/generated";
import { formatMinorAmount } from "../lib/format";

interface RateioCardProps {
  rateio: RateioListItemResponseDto;
}

function descriptionText(description: RateioListItemResponseDto["description"]) {
  return typeof description === "string" ? description : null;
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

function UsersIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 6.5a3 3 0 0 1 0 5.9M17 14a5.5 5.5 0 0 1 3.5 5"
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
  const isActive = rateio.status === "ACTIVE";

  return (
    <Link
      href={`/rateios/${rateio.id}`}
      className="group flex min-h-52 flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={
            isActive
              ? "rounded-full border border-primary/50 px-2 py-1 text-xs font-medium text-primary"
              : "rounded-full border border-muted-foreground/50 px-2 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {isActive ? "Ativo" : "Fechado"}
        </span>
        <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
          <ArrowRightIcon />
        </span>
      </div>
      <h2 className="mt-5 line-clamp-2 text-xl font-semibold">{rateio.title}</h2>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {description ?? "Sem descrição"}
      </p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div>
          <p className="text-xs text-muted-foreground">Total registrado</p>
          <p className="mt-1 text-lg font-semibold">
            {formatMinorAmount(rateio.totalAmountMinor)}
          </p>
        </div>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <UsersIcon />
          {rateio.members.length}
        </span>
      </div>
    </Link>
  );
}
