'use client';

import { UserIcon } from '@phosphor-icons/react';

import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

interface ParticipantAvatarProps {
  displayName: string;
  pictureUrl?: string | null;
  className?: string;
}

export default function ParticipantAvatar({
  displayName,
  pictureUrl,
  className,
}: ParticipantAvatarProps) {
  return (
    <Avatar
      className={cn('size-8', className)}
      title={displayName}
      aria-hidden="true"
    >
      <AvatarImage
        src={pictureUrl ?? undefined}
        alt=""
        referrerPolicy="no-referrer"
      />
      <AvatarFallback>
        <UserIcon size={16} aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  );
}
