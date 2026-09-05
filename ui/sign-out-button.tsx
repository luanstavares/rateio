"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      router.replace("/");
      router.refresh();
    } catch {
      setError("Não foi possível sair. Tente novamente.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="w-full" disabled={pending} onClick={signOut}>
        {pending ? "Saindo..." : "Sair da conta"}
      </Button>
      {error && <p role="alert" className="text-sm text-foreground">{error}</p>}
    </div>
  );
}
