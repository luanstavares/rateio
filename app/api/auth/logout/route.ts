import { NextResponse } from 'next/server';
import { logoutSession } from '../../../../lib/auth/server-session';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  await logoutSession(response);
  return response;
}
