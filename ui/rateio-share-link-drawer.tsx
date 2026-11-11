'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { CopyIcon } from '@phosphor-icons/react';
import { listShareLinks } from '../app/actions/rateios';
import type { ShareLinkMetadataResponseDto } from '../lib/api/generated';
import { Button } from './components/ui/button';
import ConfirmationDialog from './confirmation-dialog';
import {
  rateioShareLinksQueryKey,
  useRateioMutations,
} from './rateio-provider';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from './components/ui/drawer';

interface RateioShareLinkDrawerProps {
  rateioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}

function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? 'Data indisponível'
    : date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

function statusLabel(status: ShareLinkMetadataResponseDto['status']): string {
  return status === 'ACTIVE' ? 'Ativo' : 'Revogado';
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 5v14m-7-7h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export default function RateioShareLinkDrawer({
  rateioId,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: RateioShareLinkDrawerProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const { createShareLink, revokeShareLink } = useRateioMutations();
  const linksQuery = useQuery({
    queryKey: rateioShareLinksQueryKey(rateioId),
    queryFn: async () => {
      const result = await listShareLinks(rateioId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: open,
  });
  const links = linksQuery.data ?? [];
  const isPending =
    linksQuery.isFetching ||
    createShareLink.isPending ||
    revokeShareLink.isPending;

  const activeLink = links.find((link) => link.status === 'ACTIVE');

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    setShareUrl(null);
    setCopyState('idle');
    setError(null);
  }

  async function handleCreate() {
    setError(null);
    setCopyState('idle');
    try {
      const result = await createShareLink.mutateAsync(undefined);
      if (!result.success) {
        return result;
      }

      const created = result.data;
      setShareUrl(
        `${window.location.origin}/rateios/entrar?token=${encodeURIComponent(created.token)}`,
      );
      return result;
    } catch {
      return {
        success: false,
        error: 'Não foi possível gerenciar o link agora. Tente novamente.',
      } as const;
    }
  }

  async function handleInitialCreate() {
    const result = await handleCreate();
    if (!result.success) setError(result.error);
  }

  async function handleRevoke() {
    if (!activeLink) return;

    setError(null);
    const result = await revokeShareLink.mutateAsync(activeLink.id);
    if (result.success) {
      setShareUrl(null);
      setCopyState('idle');
    }
    return result;
  }

  async function handleCopy() {
    if (!shareUrl) return;

    setError(null);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
      setError('Não foi possível copiar o link. Copie-o manualmente.');
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        className="max-h-[90vh] overflow-y-auto px-8"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DrawerTitle>Link de entrada</DrawerTitle>
        <DrawerDescription>
          Crie um link para seus amigos entrarem neste rateio sem criar uma
          conta.
        </DrawerDescription>

        {isPending && links.length === 0 ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Carregando links...
          </p>
        ) : null}

        {error || linksQuery.error ? (
          <div
            className="rounded-md border border-destructive/50 p-4 text-sm text-destructive"
            role="alert"
          >
            {error ?? linksQuery.error?.message}
          </div>
        ) : null}

        {activeLink ? (
          <div className="rounded-md border border-primary/50 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Link atual</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Criado em {formatCreatedAt(activeLink.createdAt)}
                </p>
              </div>
              <span className="rounded-full border border-primary/50 px-2 py-1 text-xs text-primary">
                Ativo
              </span>
            </div>
            {shareUrl ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  aria-label="Link atual do rateio"
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  readOnly
                  value={shareUrl}
                />
                <Button type="button" onClick={handleCopy}>
                  <CopyIcon />
                  {copyState === 'copied' ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Por segurança, o link só fica disponível depois de criar ou
                regenerar.
              </p>
            )}
            <ConfirmationDialog
              title="Revogar link de entrada?"
              description="Este link deixará de permitir novas entradas no rateio. Para compartilhar novamente, será necessário criar outro link."
              confirmLabel="Revogar link"
              pendingLabel="Revogando..."
              errorMessage="Não foi possível revogar o link agora. Tente novamente."
              onConfirm={handleRevoke}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isPending}
                >
                  <CloseIcon />
                  Revogar link atual
                </Button>
              }
            />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Nenhum link ativo. Crie um link para compartilhar este rateio.
          </div>
        )}

        {activeLink ? (
          <ConfirmationDialog
            title="Regenerar link de entrada?"
            description="O link atual será invalidado. Compartilhe o novo link com quem ainda precisa entrar no rateio."
            confirmLabel="Regenerar link"
            pendingLabel="Regenerando..."
            onConfirm={handleCreate}
            trigger={
              <Button type="button" disabled={isPending}>
                <PlusIcon />
                Regenerar link
              </Button>
            }
          />
        ) : (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => void handleInitialCreate()}
          >
            <PlusIcon />
            Criar link
          </Button>
        )}

        {links.length > 0 ? (
          <div>
            <h2 className="text-sm font-semibold">Histórico</h2>
            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {formatCreatedAt(link.createdAt)}
                  </span>
                  <span
                    className={
                      link.status === 'ACTIVE'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }
                  >
                    {statusLabel(link.status)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <DrawerClose asChild>
          <Button type="button" variant="ghost">
            Fechar
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
