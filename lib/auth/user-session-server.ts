import 'server-only';

import { getCurrentUser } from './server-session';
import type { UserSession } from './user-session';

export async function getUserSession(): Promise<UserSession | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    userId: user.sub,
    email: user.email,
    name: user.name,
    pictureUrl: user.pictureUrl,
    preferredLocale: user.preferredLocale,
  };
}
