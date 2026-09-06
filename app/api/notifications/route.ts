import { NextResponse } from 'next/server';
import { z } from 'zod';
import { notificationsControllerList } from '../../../lib/api/generated';
import {
  apiErrorResponse,
  getAuthenticatedNotificationClient,
  unauthorizedResponse,
} from '../../../lib/api/notification-route';

export const runtime = 'nodejs';

const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  unreadOnly: z.coerce.boolean().default(false),
});

export async function GET(request: Request): Promise<NextResponse> {
  const path = '/api/notifications';
  const client = await getAuthenticatedNotificationClient();
  if (!client) return unauthorizedResponse(path);

  const url = new URL(request.url);
  const parsedQuery = notificationListQuerySchema.safeParse(
    Object.fromEntries(url.searchParams.entries()),
  );
  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        statusCode: 400,
        message: 'Parâmetros de notificação inválidos.',
        error: 'Bad Request',
        path,
        timestamp: new Date().toISOString(),
        details: parsedQuery.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const result = await notificationsControllerList({
    client,
    query: parsedQuery.data,
  });
  if (result.error !== undefined || result.data === undefined) {
    return apiErrorResponse(result.error, path);
  }

  return NextResponse.json(result.data, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
