'use client';

import { useRef, useState, type ReactElement, type ReactNode } from 'react';

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

type ConfirmationResult = { success: true } | { success: false; error: string };

interface ConfirmationDialogProps {
  trigger?: ReactElement;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  variant?: 'default' | 'destructive';
  errorMessage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onConfirm: () =>
    void | ConfirmationResult | Promise<void | ConfirmationResult>;
}

export default function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel = 'Salvando...',
  variant = 'destructive',
  errorMessage = 'Não foi possível concluir a ação agora. Tente novamente.',
  open: controlledOpen,
  onOpenChange,
  onCloseAutoFocus,
  onConfirm,
}: ConfirmationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const open = controlledOpen ?? internalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (submitting.current) return;
    setError(null);
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  async function handleConfirm() {
    if (submitting.current) return;
    submitting.current = true;
    setIsPending(true);
    setError(null);
    let succeeded = false;
    try {
      const result = await onConfirm();
      if (result && !result.success) {
        setError(result.error);
      } else {
        succeeded = true;
      }
    } catch {
      setError(errorMessage);
    } finally {
      submitting.current = false;
      setIsPending(false);
    }
    if (succeeded) handleOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent
        aria-busy={isPending}
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={(event) => {
          if (submitting.current) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            variant="secondary"
            disabled={isPending}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant={variant}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
