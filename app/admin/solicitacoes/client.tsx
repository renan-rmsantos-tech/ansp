"use client";

import { useState, useMemo, useCallback } from "react";
import { StatsDashboard, computeStats } from "../_components/stats-dashboard";
import { ApplicationCard, type ApplicationSummary } from "../_components/application-card";

type StatusFilter = "todos" | "pendente" | "aprovada" | "rejeitada";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "aprovada", label: "Aprovada" },
  { value: "rejeitada", label: "Rejeitada" },
];

interface SolicitacoesClientProps {
  initialApplications: ApplicationSummary[];
}

export function SolicitacoesClient({ initialApplications }: SolicitacoesClientProps) {
  const [applications, setApplications] = useState<ApplicationSummary[]>(initialApplications);
  const [filter, setFilter] = useState<StatusFilter>("todos");

  const stats = useMemo(() => computeStats(applications), [applications]);

  const filtered = useMemo(() => {
    if (filter === "todos") return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const handleDecision = useCallback(
    (id: string, status: string, desconto_concedido?: number | null) => {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status,
                desconto_concedido: desconto_concedido ?? app.desconto_concedido,
                data_decisao: status !== "pendente" ? new Date().toISOString() : null,
              }
            : app
        )
      );
    },
    []
  );

  return (
    <>
      <StatsDashboard stats={stats} />

      <div className="mt-6 flex gap-2" data-testid="status-filters">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filter === opt.value
                ? "bg-accent text-white"
                : "border border-border text-muted hover:bg-bg"
            }`}
            data-testid={`filter-${opt.value}`}
            aria-pressed={filter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3" data-testid="application-list">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Nenhuma solicitação encontrada.
          </p>
        ) : (
          filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onDecision={handleDecision}
            />
          ))
        )}
      </div>
    </>
  );
}
