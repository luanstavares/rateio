'use client';

import type { RateioStatus } from '../lib/api/rateios';
import ConfirmationDialog from './confirmation-dialog';
import { useRateioMutations } from './rateio-provider';

interface RateioStatusControlProps {
  status: RateioStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}

export default function RateioStatusControl({
  status,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: RateioStatusControlProps) {
  const { changeStatus } = useRateioMutations();
  const nextStatus: RateioStatus = status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
  const actionLabel = status === 'ACTIVE' ? 'Fechar rateio' : 'Reabrir rateio';

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onCloseAutoFocus={onCloseAutoFocus}
      title={`${actionLabel}?`}
      description={
        status === 'ACTIVE'
          ? 'O rateio ficará fechado para alterações de despesas. Você poderá reabri-lo depois.'
          : 'Os participantes poderão voltar a alterar as despesas deste rateio.'
      }
      confirmLabel={actionLabel}
      variant={status === 'ACTIVE' ? 'destructive' : 'default'}
      errorMessage="Não foi possível alterar o status do rateio. Tente novamente."
      onConfirm={() => changeStatus.mutateAsync(nextStatus)}
    />
  );
}
