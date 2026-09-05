"use client";

import { io, type Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

import { getApiBaseUrl } from "../lib/api/config";
import {
  realtimeJoinResponseSchema,
  realtimeStateSnapshotSchema,
  type RealtimeConnectionStatus,
  type RealtimeStateSnapshot,
} from "../lib/realtime/contracts";
import RateioSessionLayout, {
  type RateioSessionBalance,
  type RateioSessionItem,
} from "./rateio-session-layout";

type ServerToClientEvents = {
  "rateio.state": (snapshot: unknown) => void;
};

type ClientToServerEvents = {
  "rateio.join": (
    payload: { rateioId: string },
    acknowledge: (response: unknown) => void,
  ) => void;
};

type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface RateioRealtimeSessionProps {
  rateioId: string;
  authenticated: boolean;
  initial: {
    baseCurrency: string;
    status: "ACTIVE" | "CLOSED";
    items: RateioSessionItem[];
    balances: RateioSessionBalance[];
    balancesError: boolean;
    participantCount: number;
    totalAmountMinor: string | null;
  };
}

function sessionFromSnapshot(
  snapshot: RealtimeStateSnapshot,
): RateioRealtimeSessionProps["initial"] {
  const memberNames = new Map(
    snapshot.members.map((member) => [member.id, member.displayName]),
  );

  return {
    baseCurrency: snapshot.rateio.baseCurrency,
    status: snapshot.rateio.status,
    items: snapshot.expenses.flatMap((expense) =>
      expense.items.map((item) => ({
        id: item.id,
        name: item.name,
        amountMinor: item.baseAmountMinor,
        payerName: memberNames.get(expense.payerMemberId) ?? null,
      })),
    ),
    balances: snapshot.balances,
    balancesError: false,
    participantCount: snapshot.members.length,
    totalAmountMinor: snapshot.totalAmountMinor,
  };
}

function statusMessage(status: RealtimeConnectionStatus): string {
  switch (status) {
    case "connected":
      return "Atualizado em tempo real";
    case "connecting":
      return "Conectando às atualizações...";
    case "reconnecting":
      return "Reconectando às atualizações...";
    case "error":
      return "Não foi possível atualizar em tempo real. Recarregue a página.";
    default:
      return "Atualizações em tempo real desconectadas.";
  }
}

function statusClassName(status: RealtimeConnectionStatus): string {
  return status === "error"
    ? "text-destructive"
    : status === "connected"
      ? "text-primary"
      : "text-muted-foreground";
}

async function refreshAuthenticatedSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default function RateioRealtimeSession({
  rateioId,
  authenticated,
  initial,
}: RateioRealtimeSessionProps) {
  const [session, setSession] = useState(initial);
  const [status, setStatus] = useState<RealtimeConnectionStatus>("connecting");
  const refreshInFlight = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    let mounted = true;
    const socket: RealtimeSocket = io(`${getApiBaseUrl()}/rateios`, {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
    });

    function setMountedStatus(nextStatus: RealtimeConnectionStatus) {
      if (mounted) setStatus(nextStatus);
    }

    function refreshAndReconnect() {
      if (!authenticated || refreshInFlight.current) return;

      const refresh = refreshAuthenticatedSession();
      refreshInFlight.current = refresh;
      void refresh.then((refreshed) => {
        refreshInFlight.current = null;
        if (!mounted || !refreshed) return;
        setMountedStatus("reconnecting");
        socket.connect();
      });
    }

    socket.on("connect", () => {
      setMountedStatus("connected");
      socket.emit("rateio.join", { rateioId }, (response) => {
        const parsed = realtimeJoinResponseSchema.safeParse(response);
        if (!parsed.success || parsed.data.event === "rateio.error") {
          setMountedStatus("error");
          socket.disconnect();
        }
      });
    });

    socket.on("rateio.state", (payload) => {
      const parsed = realtimeStateSnapshotSchema.safeParse(payload);
      if (!parsed.success || parsed.data.rateio.id !== rateioId) {
        setMountedStatus("error");
        return;
      }
      if (mounted) setSession(sessionFromSnapshot(parsed.data));
    });

    socket.on("disconnect", (reason) => {
      setMountedStatus(
        reason === "io client disconnect" ? "disconnected" : "reconnecting",
      );
      if (reason === "io server disconnect") refreshAndReconnect();
    });

    socket.on("connect_error", () => {
      setMountedStatus("error");
      refreshAndReconnect();
    });

    socket.io.on("reconnect_attempt", () => {
      setMountedStatus("reconnecting");
    });

    socket.connect();

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [authenticated, rateioId]);

  return (
    <>
      <p
        aria-live="polite"
        className={`mt-4 text-sm ${statusClassName(status)}`}
        role="status"
      >
        {statusMessage(status)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {session.status === "ACTIVE"
          ? "Rateio aberto para novas alterações."
          : "Rateio fechado para novas alterações."}
      </p>
      <RateioSessionLayout {...session} />
    </>
  );
}
