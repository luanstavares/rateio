export interface ParticipantProfile {
  userId: string | null;
  displayName: string;
  pictureUrl: string | null;
}

export function participantProfile(value: unknown): ParticipantProfile {
  const member = value && typeof value === 'object' ? value : {};
  const user =
    'user' in member && member.user && typeof member.user === 'object'
      ? member.user
      : {};
  const displayName = 'displayName' in member ? member.displayName : null;
  const name = 'name' in user ? user.name : null;
  const pictureUrl = 'pictureUrl' in user ? user.pictureUrl : null;
  const memberUserId = 'userId' in member ? member.userId : null;
  const userId =
    typeof memberUserId === 'string' && memberUserId.trim()
      ? memberUserId
      : 'id' in user
        ? user.id
        : null;

  return {
    userId: typeof userId === 'string' && userId.trim() ? userId : null,
    displayName:
      typeof displayName === 'string' && displayName.trim()
        ? displayName
        : typeof name === 'string' && name.trim()
          ? name
          : 'Participante',
    pictureUrl:
      typeof pictureUrl === 'string' && pictureUrl.trim() ? pictureUrl : null,
  };
}
