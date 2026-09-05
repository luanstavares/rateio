"use client";

import { User } from "phosphor-react";
import type { AuthenticatedUserDto } from "../lib/api/generated";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";

export type AccountProfile = Pick<AuthenticatedUserDto, "name" | "email" | "pictureUrl">;

interface AccountAvatarProps {
  profile: AccountProfile;
  className?: string;
}

export default function AccountAvatar({ profile, className }: AccountAvatarProps) {
  return (
    <Avatar className={className} aria-hidden="true">
      <AvatarImage src={profile.pictureUrl ?? undefined} alt="" referrerPolicy="no-referrer" />
      <AvatarFallback><User size={20} /></AvatarFallback>
    </Avatar>
  );
}
