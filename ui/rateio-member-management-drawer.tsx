'use client';

import { useRef, useState } from 'react';

import { UsersThreeIcon } from '@phosphor-icons/react';
import type { MembershipRole } from '../lib/api/rateios';
import type { RateioSessionMember } from '../lib/rateio/session-data';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Button } from './components/ui/button';
import ConfirmationDialog from './confirmation-dialog';
import { useRateioMutations } from './rateio-provider';
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

interface RateioMemberManagementDrawerProps {
  members: RateioSessionMember[];
  currentMemberId: string;
  currentRole: MembershipRole;
}

function memberName(member: RateioSessionMember): string {
  return (
    optionalString(member.displayName) ??
    optionalString(member.user?.name) ??
    optionalString(member.user?.email) ??
    'Participante'
  );
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter((initial): initial is string => initial !== undefined)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function roleLabel(role: MembershipRole): string {
  switch (role) {
    case 'OWNER':
      return 'Responsável';
    case 'ADMIN':
      return 'Administrador';
    default:
      return 'Participante';
  }
}

export default function RateioMemberManagementDrawer({
  members,
  currentMemberId,
  currentRole,
}: RateioMemberManagementDrawerProps) {
  const [open, setOpen] = useState(false);
  const [roleChange, setRoleChange] = useState<{
    member: RateioSessionMember;
    role: MembershipRole;
  } | null>(null);
  const roleSelect = useRef<HTMLSelectElement | null>(null);
  const { changeMemberRole, removeMember } = useRateioMutations();
  const isPending = changeMemberRole.isPending || removeMember.isPending;
  const canManage = currentRole === 'OWNER' || currentRole === 'ADMIN';
  const canChangeRoles = currentRole === 'OWNER';

  function canRemove(member: RateioSessionMember): boolean {
    if (member.id === currentMemberId || member.role === 'OWNER') return false;
    return currentRole === 'OWNER' || member.role === 'PARTICIPANT';
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button type="button" variant="outline" className="w-full sm:w-auto">
          <UsersThreeIcon />
          Gerenciar participantes
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] p-0">
        <DrawerHeader>
          <DrawerTitle>Participantes</DrawerTitle>
          <DrawerDescription>
            Veja quem participa deste rateio e os papéis de cada pessoa.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum participante ativo encontrado.
            </p>
          ) : (
            <ul className="space-y-3 pb-4">
              {members.map((member) => {
                const name = memberName(member);
                const pictureUrl = optionalString(member.user?.pictureUrl);
                const isSelf = member.id === currentMemberId;
                return (
                  <li
                    key={member.id}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        {pictureUrl ? (
                          <AvatarImage alt={name} src={pictureUrl} />
                        ) : null}
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {name}
                          {isSelf ? ' (você)' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {roleLabel(member.role)}
                        </p>
                      </div>
                    </div>

                    {canManage && (canChangeRoles || canRemove(member)) ? (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                        {canChangeRoles &&
                        !isSelf &&
                        member.role !== 'OWNER' ? (
                          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                            <span className="sr-only">Papel de {name}</span>
                            <select
                              aria-label={`Papel de ${name}`}
                              className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              disabled={isPending}
                              onChange={(event) => {
                                const role = event.target.value;
                                if (
                                  (role === 'ADMIN' ||
                                    role === 'PARTICIPANT') &&
                                  role !== member.role
                                ) {
                                  roleSelect.current = event.currentTarget;
                                  setRoleChange({ member, role });
                                }
                              }}
                              value={member.role}
                            >
                              <option value="ADMIN">Administrador</option>
                              <option value="PARTICIPANT">Participante</option>
                            </select>
                          </label>
                        ) : null}
                        {canRemove(member) ? (
                          <ConfirmationDialog
                            title={`Remover ${name}?`}
                            description="Esta pessoa perderá o acesso ao rateio. Todas as despesas ativas serão divididas igualmente entre os participantes restantes, substituindo as divisões anteriores. O histórico e os valores já pagos serão preservados."
                            confirmLabel="Remover participante"
                            pendingLabel="Removendo..."
                            errorMessage="Não foi possível remover o participante agora. Tente novamente."
                            onConfirm={() =>
                              removeMember.mutateAsync(member.id)
                            }
                            trigger={
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={isPending}
                              >
                                Remover
                              </Button>
                            }
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <ConfirmationDialog
          open={roleChange !== null}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setRoleChange(null);
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            roleSelect.current?.focus();
          }}
          title="Alterar papel do participante?"
          description={
            roleChange
              ? `${memberName(roleChange.member)} passará a ser ${roleLabel(roleChange.role).toLocaleLowerCase('pt-BR')}. ${roleChange.role === 'ADMIN' ? 'Essa pessoa poderá gerenciar itens e remover participantes.' : 'Essa pessoa perderá as permissões de administrador.'}`
              : ''
          }
          confirmLabel="Alterar papel"
          variant="default"
          errorMessage="Não foi possível alterar o papel agora. Tente novamente."
          onConfirm={() => {
            if (!roleChange) return;
            return changeMemberRole.mutateAsync({
              memberId: roleChange.member.id,
              role: roleChange.role,
            });
          }}
        />

        <DrawerFooter>
          {isPending ? (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              Salvando alteração...
            </p>
          ) : null}
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
