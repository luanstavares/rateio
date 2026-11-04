export interface ParticipantProfile {
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

  return {
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
