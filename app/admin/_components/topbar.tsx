"use client";

import { useTransition } from "react";
import { logout } from "@/app/login/_actions/auth-actions";
import { SealLogo } from "@/components/ui/seal-logo";

export function Topbar() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => logout());
  }

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] flex items-center justify-between border-b border-border bg-surface px-6 py-3.5">
      <div className="flex items-center gap-3">
        <SealLogo size={32} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Arca N. S. da Providência
        </span>
        <span className="h-5 w-px bg-border" />
        <span className="text-base font-semibold leading-tight tracking-tight">
          Administração
        </span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="rounded-[6px] border border-border bg-transparent px-4 py-[7px] text-xs font-medium tracking-[0.02em] text-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
      >
        {isPending ? "Saindo…" : "Sair"}
      </button>
    </header>
  );
}
