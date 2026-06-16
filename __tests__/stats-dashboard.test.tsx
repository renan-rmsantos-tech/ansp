import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StatsDashboard, computeStats } from "@/app/admin/_components/stats-dashboard";

describe("computeStats", () => {
  it("counts pending, approved, rejected correctly", () => {
    const apps = [
      { status: "pendente" },
      { status: "pendente" },
      { status: "aprovada" },
      { status: "rejeitada" },
      { status: "aprovada" },
    ];
    const stats = computeStats(apps);
    expect(stats).toEqual({ total: 5, pendente: 2, aprovada: 2, rejeitada: 1 });
  });

  it("returns zeros for empty list", () => {
    expect(computeStats([])).toEqual({ total: 0, pendente: 0, aprovada: 0, rejeitada: 0 });
  });
});

describe("StatsDashboard", () => {
  afterEach(cleanup);

  it("renders correct counts for pending/approved/rejected", () => {
    const stats = { total: 10, pendente: 5, aprovada: 3, rejeitada: 2 };
    render(<StatsDashboard stats={stats} />);

    expect(screen.getByTestId("stat-total")).toHaveTextContent("10");
    expect(screen.getByTestId("stat-pendentes")).toHaveTextContent("5");
    expect(screen.getByTestId("stat-aprovadas")).toHaveTextContent("3");
    expect(screen.getByTestId("stat-rejeitadas")).toHaveTextContent("2");
  });

  it("renders labels", () => {
    const stats = { total: 0, pendente: 0, aprovada: 0, rejeitada: 0 };
    render(<StatsDashboard stats={stats} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Pendentes")).toBeInTheDocument();
    expect(screen.getByText("Aprovadas")).toBeInTheDocument();
    expect(screen.getByText("Rejeitadas")).toBeInTheDocument();
  });
});
