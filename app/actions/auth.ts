'use server';

import { getUserSession } from '../../lib/auth/user-session-server';
import type { UserSession } from '../../lib/auth/user-session';

export async function readUserSession(): Promise<UserSession | null> {
  return getUserSession();
}
