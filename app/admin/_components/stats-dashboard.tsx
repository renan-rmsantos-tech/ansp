"use client";

interface StatsData {
  pendente: number;
  aprovada: number;
  rejeitada: number;
  total: number;
}

interface StatsDashboardProps {
  stats: StatsData;
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const items = [
    { label: "Total", value: stats.total, color: "text-fg" },
    { label: "Pendentes", value: stats.pendente, color: "text-warn" },
    { label: "Aprovadas", value: stats.aprovada, color: "text-success" },
    { label: "Rejeitadas", value: stats.rejeitada, color: "text-danger" },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      data-testid="stats-dashboard"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-surface px-4 py-3"
          data-testid={`stat-${item.label.toLowerCase()}`}
        >
          <div className="text-xs font-medium text-muted">{item.label}</div>
          <div className={`mt-1 font-heading text-2xl font-semibold ${item.color}`}>
            {item.value}
          </div>
        </div>
      ))}
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
