'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import {
  joinRateioAnonymously,
  type JoinRateioResult,
} from '../app/actions/rateios';
import { Button } from './components/ui/button';

interface RateioJoinFormProps {
  initialToken: string;
}

export default function RateioJoinForm({ initialToken }: RateioJoinFormProps) {
  const router = useRouter();
  const [token, setToken] = useState(initialToken);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const joinRateioMutation = useMutation<
    JoinRateioResult,
    Error,
    { token: string; displayName: string }
  >({
    mutationFn: joinRateioAnonymously,
    onError: () => {
      setError('Não foi possível entrar neste rateio agora. Tente novamente.');
    },
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error);
        return;
      }

      router.replace(`/rateios/${result.data.rateioId}`);
    },
  });
  const isPending = joinRateioMutation.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    joinRateioMutation.mutate({ token, displayName });
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="rateio-token">
          Código do link
        </label>
        <input
          autoComplete="off"
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          id="rateio-token"
          inputMode="text"
          maxLength={64}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Cole o código do link compartilhado"
          spellCheck={false}
          value={token}
        />
        <p className="text-xs text-muted-foreground">
          Você pode abrir o link compartilhado e preencher este campo
          automaticamente.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="rateio-display-name">
          Como devemos chamar você?
        </label>
        <input
          autoComplete="name"
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          id="rateio-display-name"
          maxLength={80}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Seu nome no rateio"
          required
          value={displayName}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? 'Entrando...' : 'Entrar no rateio'}
      </Button>
    </form>
  );
}
