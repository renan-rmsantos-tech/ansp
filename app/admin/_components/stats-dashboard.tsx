"use client";

export type StatusFilter = "todos" | "pendente" | "aprovada" | "rejeitada";

interface StatsData {
  pendente: number;
  aprovada: number;
  rejeitada: number;
  total: number;
}

interface StatsDashboardProps {
  stats: StatsData;
  activeFilter?: StatusFilter;
  onFilterSelect?: (filter: StatusFilter) => void;
}

const ITEMS: {
  label: string;
  filter: StatusFilter;
  statKey: keyof StatsData;
  color: string;
  testId: string;
}[] = [
  { label: "Total", filter: "todos", statKey: "total", color: "text-fg", testId: "total" },
  {
    label: "Pendentes",
    filter: "pendente",
    statKey: "pendente",
    color: "text-warn",
    testId: "pendentes",
  },
  {
    label: "Aprovadas",
    filter: "aprovada",
    statKey: "aprovada",
    color: "text-success",
    testId: "aprovadas",
  },
  {
    label: "Rejeitadas",
    filter: "rejeitada",
    statKey: "rejeitada",
    color: "text-danger",
    testId: "rejeitadas",
  },
];

export function StatsDashboard({
  stats,
  activeFilter = "todos",
  onFilterSelect,
}: StatsDashboardProps) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      data-testid="stats-dashboard"
    >
      {ITEMS.map((item) => {
        const isActive = activeFilter === item.filter;
        const interactive = Boolean(onFilterSelect);

        const className = [
          "rounded-lg border px-4 py-3 text-left transition-colors",
          isActive
            ? "border-accent bg-[oklch(94%_0.02_250)]"
            : "border-border bg-surface",
          interactive ? "cursor-pointer hover:border-accent/40 hover:bg-bg" : "",
        ].join(" ");

        const content = (
          <>
            <div className="text-xs font-medium text-muted">{item.label}</div>
            <div className={`mt-1 text-2xl font-semibold tabular-nums ${item.color}`}>
              {stats[item.statKey]}
            </div>
          </>
        );

        if (interactive) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onFilterSelect!(item.filter)}
              className={className}
              data-testid={`stat-${item.testId}`}
              aria-pressed={isActive}
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={item.label}
            className={className}
            data-testid={`stat-${item.testId}`}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

export function computeStats(
  applications: Array<{ status: string }>
): StatsData {
  const stats = { pendente: 0, aprovada: 0, rejeitada: 0, total: 0 };
  for (const app of applications) {
    stats.total++;
    if (app.status === "pendente") stats.pendente++;
    else if (app.status === "aprovada") stats.aprovada++;
    else if (app.status === "rejeitada") stats.rejeitada++;
  }
  return stats;
}
