'use client';

import { useRef, useState } from 'react';
import {
  ArrowCounterClockwiseIcon,
  ClockUserIcon,
  DotsThreeIcon,
  LinkIcon,
  TrashIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { DropdownMenu } from 'radix-ui';

import { Button } from './components/ui/button';
import RateioActivityDrawer from './rateio-activity-drawer';
import RateioMemberManagementDrawer from './rateio-member-management-drawer';
import { useRateio } from './rateio-provider';
import RateioShareLinkDrawer from './rateio-share-link-drawer';
import RateioStatusControl from './rateio-status-control';

type RateioAction = 'share-link' | 'members' | 'activity' | 'status';

const menuItemClassName =
  'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&_svg]:size-4 [&_svg]:shrink-0';

export default function RateioActionsMenu() {
  const { data } = useRateio();
  const [action, setAction] = useState<RateioAction | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const currentMember = data.members.find(
    (member) => member.id === data.currentMemberId,
  );
  const isOwner = data.currentRole === 'OWNER';
  const canViewActivity = isOwner || currentMember?.role === 'ADMIN';
  const isActive = data.rateio.status === 'ACTIVE';

  function handleOpenChange(open: boolean) {
    if (!open) setAction(null);
  }

  function restoreFocus(event: Event) {
    event.preventDefault();
    triggerRef.current?.focus();
  }

  if (!currentMember) return null;

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            ref={triggerRef}
            aria-label="Opções do rateio"
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground data-[state=open]:bg-primary/10 data-[state=open]:text-primary [&_svg]:size-6"
          >
            <DotsThreeIcon aria-hidden="true" weight="bold" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            collisionPadding={16}
            className="z-50 max-w-[calc(100vw-2rem)] min-w-60 rounded-xl border border-border bg-secondary p-1.5 text-foreground shadow-lg"
            onCloseAutoFocus={(event) => {
              if (action) event.preventDefault();
            }}
          >
            {isOwner ? (
              <DropdownMenu.Item
                className={menuItemClassName}
                onSelect={() => setAction('share-link')}
              >
                <LinkIcon aria-hidden="true" />
                Gerenciar link de entrada
              </DropdownMenu.Item>
            ) : null}
            <DropdownMenu.Item
              className={menuItemClassName}
              onSelect={() => setAction('members')}
            >
              <UsersThreeIcon aria-hidden="true" />
              Gerenciar participantes
            </DropdownMenu.Item>
            {canViewActivity ? (
              <DropdownMenu.Item
                className={menuItemClassName}
                onSelect={() => setAction('activity')}
              >
                <ClockUserIcon aria-hidden="true" />
                Histórico de atividades
              </DropdownMenu.Item>
            ) : null}
            {isOwner ? (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  className={`${menuItemClassName} ${isActive ? 'text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive' : ''}`}
                  onSelect={() => setAction('status')}
                >
                  {isActive ? (
                    <TrashIcon aria-hidden="true" />
                  ) : (
                    <ArrowCounterClockwiseIcon aria-hidden="true" />
                  )}
                  {isActive ? 'Fechar rateio' : 'Reabrir rateio'}
                </DropdownMenu.Item>
              </>
            ) : null}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {isOwner ? (
        <RateioShareLinkDrawer
          rateioId={data.rateio.id}
          open={action === 'share-link'}
          onOpenChange={handleOpenChange}
          onCloseAutoFocus={restoreFocus}
        />
      ) : null}
      <RateioMemberManagementDrawer
        currentMemberId={currentMember.id}
        currentRole={currentMember.role}
        members={data.members}
        open={action === 'members'}
        onOpenChange={handleOpenChange}
        onCloseAutoFocus={restoreFocus}
      />
      {canViewActivity ? (
        <RateioActivityDrawer
          events={data.activityEvents}
          open={action === 'activity'}
          onOpenChange={handleOpenChange}
          onCloseAutoFocus={restoreFocus}
        />
      ) : null}
      {isOwner ? (
        <RateioStatusControl
          status={data.rateio.status}
          open={action === 'status'}
          onOpenChange={handleOpenChange}
          onCloseAutoFocus={restoreFocus}
        />
      ) : null}
    </>
  );
}
