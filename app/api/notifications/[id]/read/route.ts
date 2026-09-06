import { NextResponse } from 'next/server';
import { z } from 'zod';
import { notificationsControllerRead } from '../../../../../lib/api/generated';
import {
  apiErrorResponse,
  getAuthenticatedNotificationClient,
  unauthorizedResponse,
} from '../../../../../lib/api/notification-route';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

const notificationIdSchema = z.string().trim().min(1);

export async function PATCH(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id: rawId } = await context.params;
  const path = `/api/notifications/${rawId}/read`;
  const id = notificationIdSchema.safeParse(rawId);
  if (!id.success) {
    return NextResponse.json(
      {
        statusCode: 400,
        message: 'Identificador de notificação inválido.',
        error: 'Bad Request',
        path,
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  const client = await getAuthenticatedNotificationClient();
  if (!client) return unauthorizedResponse(path);

  const result = await notificationsControllerRead({
    client,
    path: { id: id.data },
  });
  if (result.error !== undefined || result.data === undefined) {
    return apiErrorResponse(result.error, path);
  }

  return NextResponse.json(result.data, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
