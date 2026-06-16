"use client";

import { useState, useTransition } from "react";
import { login } from "./_actions/auth-actions";
import { SealLogo } from "@/components/ui/seal-logo";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-[400px] rounded-md border border-border bg-surface px-8 py-10">
        <div className="mb-8 text-center">
          <SealLogo size={72} className="mx-auto mb-4" />
          <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Arca N. S. da Providência
          </p>
          <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight">
            Área Administrativa
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Acesso restrito à direção
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-[6px] bg-[oklch(95%_0.04_25)] px-3.5 py-2.5 text-[13px] text-danger"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block text-[13px] font-medium tracking-[0.02em]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              required
              className="w-full rounded-[6px] border border-border bg-bg px-3.5 py-[11px] font-body text-[15px] leading-normal text-fg outline-none transition-colors focus:border-accent focus:ring-3 focus:ring-[oklch(94%_0.02_250)]"
              onChange={() => setError(null)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-1.5 block text-[13px] font-medium tracking-[0.02em]"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              className="w-full rounded-[6px] border border-border bg-bg px-3.5 py-[11px] font-body text-[15px] leading-normal text-fg outline-none transition-colors focus:border-accent focus:ring-3 focus:ring-[oklch(94%_0.02_250)]"
              onChange={() => setError(null)}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-[6px] bg-accent px-3 py-3 text-sm font-medium tracking-[0.02em] text-white transition-colors hover:bg-[oklch(22%_0.06_250)] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
