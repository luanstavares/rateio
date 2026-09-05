import { rotateSession } from '../../../../lib/auth/server-session';

export const runtime = 'nodejs';

export async function POST() {
  return rotateSession();
}
