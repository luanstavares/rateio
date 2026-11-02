'use client';

import { TrashIcon } from '@phosphor-icons/react';
import type { RateioStatus } from '../lib/api/rateios';
import { Button } from './components/ui/button';
import ConfirmationDialog from './confirmation-dialog';
import { useRateioMutations } from './rateio-provider';

interface RateioStatusControlProps {
  status: RateioStatus;
}

export default function RateioStatusControl({
  status,
}: RateioStatusControlProps) {
  const { changeStatus } = useRateioMutations();
  const nextStatus: RateioStatus = status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
  const actionLabel = status === 'ACTIVE' ? 'Fechar rateio' : 'Reabrir rateio';

  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="text-sm text-muted-foreground">
        Como responsável, você pode fechar o rateio quando a conta estiver
        resolvida. Essa ação pode ser revertida.
      </p>
      <ConfirmationDialog
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
        trigger={
          <Button
            type="button"
            variant={status === 'ACTIVE' ? 'destructive' : 'outline'}
            className="mt-4 w-full sm:w-auto"
            disabled={changeStatus.isPending}
          >
            {status === 'ACTIVE' && <TrashIcon />}
            {changeStatus.isPending ? 'Salvando...' : actionLabel}
          </Button>
        }
      />
    </div>
  );
}
