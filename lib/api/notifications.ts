import {
  notificationsControllerList,
  notificationsControllerRead,
  type NotificationListResponseDto,
  type NotificationResponseDto,
} from './generated';
import type { Client } from './generated/client';
import { normalizeApiResult, type ApiClientError } from './errors';
import type { RealtimeNotificationCreated } from '../realtime/contracts';

export const NOTIFICATION_PAGE_SIZE = 50;

export interface Notification {
  id: string;
  userId: string;
  rateioId: string | null;
  type: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationList {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  items: Notification[];
}

function errorMessage(error: ApiClientError): string {
  return Array.isArray(error.message)
    ? error.message.join(', ')
    : error.message;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`Notificação inválida: ${field}.`);
  return value;
}

function asNullableString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  return asString(value, field);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeNotification(value: NotificationResponseDto): Notification {
  const payload = value.payload;
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload))
    throw new Error('Notificação inválida: payload.');

  return {
    id: asString(value.id, 'id'),
    userId: asString(value.userId, 'userId'),
    rateioId: asNullableString(value.rateioId, 'rateioId'),
    type: asString(value.type, 'type'),
    title: asString(value.title, 'title'),
    body: asString(value.body, 'body'),
    payload: payload as Record<string, unknown>,
    readAt: asNullableString(value.readAt, 'readAt'),
    createdAt: asString(value.createdAt, 'createdAt'),
    updatedAt: asString(value.updatedAt, 'updatedAt'),
  };
}

export function normalizeNotificationList(
  value: NotificationListResponseDto,
): NotificationList {
  const items = value.items
    .map(normalizeNotification)
    .sort(compareNotifications);
  return {
    page: value.page,
    pageSize: value.pageSize,
    total: value.total,
    pages: value.pages,
    items,
  };
}

export function compareNotifications(a: Notification, b: Notification): number {
  const dateOrder = b.createdAt.localeCompare(a.createdAt);
  return dateOrder || b.id.localeCompare(a.id);
}

export function normalizeRealtimeNotification(
  value: RealtimeNotificationCreated,
): Notification | null {
  if (
    !value.id ||
    !value.userId ||
    value.rateioId === undefined ||
    value.readAt === undefined ||
    !value.createdAt ||
    !value.updatedAt ||
    !isRecord(value.payload)
  ) {
    return null;
  }
  return {
    id: value.id,
    userId: value.userId,
    rateioId: value.rateioId,
    type: value.type,
    title: value.title,
    body: value.body,
    payload: value.payload,
    readAt: value.readAt,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function mergeNotification(
  current: NotificationList,
  incoming: Notification,
): NotificationList {
  const existing = current.items.find((item) => item.id === incoming.id);
  const next =
    existing && existing.updatedAt.localeCompare(incoming.updatedAt) > 0
      ? existing
      : incoming;
  const items = [
    ...current.items.filter((item) => item.id !== incoming.id),
    next,
  ]
    .sort(compareNotifications)
    .slice(0, current.pageSize);
  return {
    ...current,
    total: existing ? current.total : current.total + 1,
    items,
  };
}

export async function listNotifications(
  client: Client,
): Promise<NotificationList> {
  const result = await notificationsControllerList({
    client,
    query: { page: 1, pageSize: NOTIFICATION_PAGE_SIZE },
  });
  const normalized = normalizeApiResult(result);
  if (normalized.data === undefined) {
    if (normalized.error) throw new Error(errorMessage(normalized.error));
    throw new Error('O servidor não retornou notificações válidas.');
  }
  return normalizeNotificationList(normalized.data);
}

export async function readNotification(
  client: Client,
  notificationId: string,
): Promise<Notification> {
  const result = await notificationsControllerRead({
    client,
    path: { id: notificationId },
  });
  const normalized = normalizeApiResult(result);
  if (normalized.data === undefined) {
    if (normalized.error) throw new Error(errorMessage(normalized.error));
    throw new Error('O servidor não retornou uma notificação válida.');
  }
  return normalizeNotification(normalized.data);
}
