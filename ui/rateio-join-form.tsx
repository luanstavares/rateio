'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  joinRateioAuthenticated,
  joinRateioAnonymously,
  type AuthenticatedJoinRateioResult,
  type JoinRateioResult,
} from '../app/actions/rateios';
import { Button } from './components/ui/button';
import { useUser } from './user-provider';

interface RateioJoinFormProps {
  initialToken: string;
}

export default function RateioJoinForm({ initialToken }: RateioJoinFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [token, setToken] = useState(initialToken);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [error, setError] = useState<string | null>(null);

  const joinRateioMutation = useMutation<
    JoinRateioResult | AuthenticatedJoinRateioResult,
    Error,
    { token: string; displayName?: string }
  >({
    mutationFn: ({
      token: submittedToken,
      displayName: submittedDisplayName,
    }) =>
      user
        ? joinRateioAuthenticated({ token: submittedToken })
        : joinRateioAnonymously({
            token: submittedToken,
            displayName: submittedDisplayName ?? '',
          }),
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

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    joinRateioMutation.mutate(user ? { token } : { token, displayName });
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

      {user ? (
        <p className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
          Você entrará usando sua conta{user.name ? ` (${user.name})` : ''}.
        </p>
      ) : (
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
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending
          ? 'Entrando...'
          : user
            ? 'Entrar com minha conta'
            : 'Entrar no rateio'}
      </Button>
    </form>
  );
}
