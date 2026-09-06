'use client';

import { BellIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './components/ui/drawer';
import { useNotifications } from './notification-provider';
import { useUser } from './user-provider';

function notificationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export default function NotificationCenter() {
  const { isLoggedIn } = useUser();
  const {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    markRead,
    realtimeStatus,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!isLoggedIn) return null;

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          aria-label={
            unreadCount
              ? `Notificações, ${unreadCount} não lidas`
              : 'Notificações'
          }
          className="relative"
          size="icon"
          type="button"
          variant="ghost"
        >
          <BellIcon aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              aria-hidden="true"
              className="absolute -right-1 -top-1 min-w-5 px-1"
              variant="default"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-dvh p-0">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle>Notificações</DrawerTitle>
          <DrawerDescription>
            Acompanhe novidades dos seus rateios.
          </DrawerDescription>
          <p className="text-xs text-muted-foreground" role="status">
            {realtimeStatus === 'connected'
              ? 'Atualizações em tempo real ativas.'
              : realtimeStatus === 'reconnecting' ||
                  realtimeStatus === 'connecting'
                ? 'Conectando às atualizações em tempo real...'
                : 'Atualizações em tempo real indisponíveis.'}
          </p>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando notificações...
            </p>
          ) : isError ? (
            <div className="space-y-3 py-8 text-center">
              <p className="text-sm text-destructive" role="alert">
                {error?.message ?? 'Não foi possível carregar as notificações.'}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ol className="space-y-3 py-4" aria-label="Lista de notificações">
              {notifications.map((notification) => {
                const unread = !notification.readAt;
                const isMarking =
                  markRead.isPending && markRead.variables === notification.id;
                return (
                  <li
                    className={`rounded-lg border p-3 ${
                      unread
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border'
                    }`}
                    key={notification.id}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${
                          unread ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.body}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {notificationDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    {unread && (
                      <Button
                        className="mt-3 w-full"
                        disabled={isMarking}
                        type="button"
                        variant="outline"
                        onClick={() => markRead.mutate(notification.id)}
                      >
                        {isMarking ? 'Marcando...' : 'Marcar como lida'}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {markRead.isError && (
          <p className="px-4 text-sm text-destructive" role="alert">
            {markRead.error.message}
          </p>
        )}
        <DrawerFooter>
          {isFetching && !isLoading && (
            <p className="text-center text-xs text-muted-foreground">
              Atualizando...
            </p>
          )}
          <DrawerClose asChild>
            <Button type="button" variant="ghost">
              Fechar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
