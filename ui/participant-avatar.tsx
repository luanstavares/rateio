'use client';

import { UserIcon } from '@phosphor-icons/react';

import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { useUserOnline } from './presence-context';

interface ParticipantAvatarProps {
  userId?: string | null;
  displayName: string;
  pictureUrl?: string | null;
  className?: string;
}

export default function ParticipantAvatar({
  userId,
  displayName,
  pictureUrl,
  className,
}: ParticipantAvatarProps) {
  const isOnline = useUserOnline(userId);
  return (
    <span
      className={cn(
        'relative inline-flex size-8 shrink-0 rounded-full',
        className,
      )}
      title={isOnline ? `${displayName} (Online)` : displayName}
    >
      <Avatar className="size-full" aria-hidden="true">
        <AvatarImage
          src={pictureUrl ?? undefined}
          alt=""
          referrerPolicy="no-referrer"
        />
        <AvatarFallback>
          <UserIcon size={16} aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      {isOnline ? (
        <span
          className="absolute bottom-0 right-0 size-2 rounded-full bg-success ring-2 ring-background"
          role="img"
          aria-label={`${displayName} está online`}
        />
      ) : null}
    </span>
  );
}
