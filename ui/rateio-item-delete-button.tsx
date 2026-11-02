'use client';

import { TrashIcon } from '@phosphor-icons/react';
import ConfirmationDialog from './confirmation-dialog';
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
  const { removeItem } = useRateioMutations();
  const canDelete =
    currentRole === 'OWNER' ||
    currentRole === 'ADMIN' ||
    createdByMemberId === currentMemberId;

  if (!canDelete) return null;

  return (
    <ConfirmationDialog
      title="Remover item?"
      description={`O item “${itemName}” será removido dos cálculos deste rateio. O histórico da alteração será preservado.`}
      confirmLabel="Remover item"
      pendingLabel="Removendo..."
      errorMessage="Não foi possível remover o item agora. Tente novamente."
      onConfirm={() => removeItem.mutateAsync({ expenseId, itemId })}
      trigger={
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
      }
    />
  );
}
