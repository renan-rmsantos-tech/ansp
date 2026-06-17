"use client";

import { useState, useMemo, useCallback } from "react";
import {
  StatsDashboard,
  computeStats,
  type StatusFilter,
} from "../_components/stats-dashboard";
import { ApplicationCard, type ApplicationSummary } from "../_components/application-card";

type SortKey = "data_desc" | "data_asc" | "nome" | "escola";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "aprovada", label: "Aprovada" },
  { value: "rejeitada", label: "Rejeitada" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "data_desc", label: "Mais recentes" },
  { value: "data_asc", label: "Mais antigas" },
  { value: "nome", label: "Nome da família" },
  { value: "escola", label: "Escola" },
];

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function matchesSearch(app: ApplicationSummary, query: string): boolean {
  if (!query) return true;
  const haystack = [
    app.pai_nome,
    app.mae_nome,
    app.escola,
    ...app.students.map((s) => s.nome),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function sortApplications(apps: ApplicationSummary[], sort: SortKey): ApplicationSummary[] {
  const sorted = [...apps];
  sorted.sort((a, b) => {
    switch (sort) {
      case "data_asc":
        return a.data_envio.localeCompare(b.data_envio);
      case "nome":
        return `${a.pai_nome} ${a.mae_nome}`.localeCompare(
          `${b.pai_nome} ${b.mae_nome}`,
          "pt-BR"
        );
      case "escola":
        return a.escola.localeCompare(b.escola, "pt-BR");
      case "data_desc":
      default:
        return b.data_envio.localeCompare(a.data_envio);
    }
  });
  return sorted;
}

interface SolicitacoesClientProps {
  initialApplications: ApplicationSummary[];
}

export function SolicitacoesClient({ initialApplications }: SolicitacoesClientProps) {
  const [applications, setApplications] = useState<ApplicationSummary[]>(initialApplications);
  const [filter, setFilter] = useState<StatusFilter>("todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("data_desc");

  const stats = useMemo(() => computeStats(applications), [applications]);

  const filtered = useMemo(() => {
    const query = normalizeSearch(search);
    let list = applications.filter((a) => matchesSearch(a, query));
    if (filter !== "todos") {
      list = list.filter((a) => a.status === filter);
    }
    return sortApplications(list, sort);
  }, [applications, filter, search, sort]);

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

  const filterLabel =
    FILTER_OPTIONS.find((o) => o.value === filter)?.label.toLowerCase() ?? "todos";

  return (
    <>
      <StatsDashboard
        stats={stats}
        activeFilter={filter}
        onFilterSelect={setFilter}
      />

      <div
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        data-testid="list-toolbar"
      >
        <div className="relative flex-1 sm:max-w-xs">
          <label htmlFor="search-applications" className="sr-only">
            Buscar solicitações
          </label>
          <input
            id="search-applications"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou escola..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            data-testid="search-input"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-applications" className="text-sm text-muted">
            Ordenar
          </label>
          <select
            id="sort-applications"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-fg"
            data-testid="sort-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" data-testid="status-filters">
        {FILTER_OPTIONS.map((opt) => {
          const count =
            opt.value === "todos"
              ? applications.length
              : applications.filter((a) => a.status === opt.value).length;
          return (
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
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-muted" data-testid="results-count">
        {filtered.length}{" "}
        {filtered.length === 1 ? "solicitação" : "solicitações"}
        {filter !== "todos" ? ` ${filterLabel}` : ""}
        {search.trim() ? ` para "${search.trim()}"` : ""}
      </p>

      <div className="mt-3 space-y-3" data-testid="application-list">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            {search.trim()
              ? "Nenhuma solicitação corresponde à busca. Tente outro nome ou escola."
              : filter !== "todos"
                ? `Nenhuma solicitação ${filterLabel} no momento.`
                : "Nenhuma solicitação encontrada."}
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
