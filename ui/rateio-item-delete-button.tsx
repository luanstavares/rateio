'use client';

import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './components/ui/alert-dialog';
import { Button } from './components/ui/button';
import { useRateioMutations } from './rateio-provider';

interface RateioItemDeleteButtonProps {
  expenseId: string;
  itemId: string;
  itemName: string;
  createdByMemberId: string;
  currentMemberId: string;
  currentRole: 'OWNER' | 'ADMIN' | 'PARTICIPANT';
}

export default function RateioItemDeleteButton({
  expenseId,
  itemId,
  itemName,
  createdByMemberId,
  currentMemberId,
  currentRole,
}: RateioItemDeleteButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const { removeItem } = useRateioMutations();
  const canDelete =
    currentRole === 'OWNER' ||
    currentRole === 'ADMIN' ||
    createdByMemberId === currentMemberId;

  if (!canDelete) return null;

  async function handleDelete() {
    setError(null);
    try {
      const result = await removeItem.mutateAsync({
        expenseId,
        itemId,
      });
      if (!result.success) {
        setError(result.error);
      }
    } catch {
      setError('Não foi possível remover o item agora. Tente novamente.');
    }
  }

  return (
    <div className="flex flex-col items-end">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            aria-label={`Remover item ${itemName}`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={removeItem.isPending}
            size="icon"
            type="button"
            variant="ghost"
          >
            <TrashIcon aria-hidden="true" />
          </Button>
        </AlertDialogTrigger>
        {error ? (
          <span
            className="mt-1 max-w-36 text-right text-xs text-destructive"
            role="alert"
          >
            {error}
          </span>
        ) : null}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item?</AlertDialogTitle>
            <AlertDialogDescription>
              O item “{itemName}” será removido dos cálculos deste rateio. O
              histórico da alteração será preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="secondary"
              disabled={removeItem.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={removeItem.isPending}
              onClick={() => void handleDelete()}
              variant="destructive"
            >
              {removeItem.isPending ? 'Removendo...' : 'Remover item'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
