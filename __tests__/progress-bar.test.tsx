import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProgressBar } from "@/app/form/_components/progress-bar";

describe("ProgressBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correct number of steps", () => {
    render(<ProgressBar currentStep={1} totalSteps={6} />);
    const steps = screen.getAllByTestId(/^progress-step-/);
    expect(steps).toHaveLength(6);
  });

  it("marks steps with correct active/done/pending states", () => {
    render(<ProgressBar currentStep={3} totalSteps={6} />);
    expect(screen.getByTestId("progress-step-1")).toHaveAttribute("data-state", "done");
    expect(screen.getByTestId("progress-step-2")).toHaveAttribute("data-state", "done");
    expect(screen.getByTestId("progress-step-3")).toHaveAttribute("data-state", "active");
    expect(screen.getByTestId("progress-step-4")).toHaveAttribute("data-state", "pending");
    expect(screen.getByTestId("progress-step-5")).toHaveAttribute("data-state", "pending");
    expect(screen.getByTestId("progress-step-6")).toHaveAttribute("data-state", "pending");
  });

  it("displays current step name and count", () => {
    render(<ProgressBar currentStep={2} totalSteps={6} />);
    expect(screen.getByText("2. Dados dos Alunos")).toBeInTheDocument();
    expect(screen.getByText("Etapa 2 de 6")).toBeInTheDocument();
  });

  it("first step shows only active, no done", () => {
    render(<ProgressBar currentStep={1} totalSteps={6} />);
    expect(screen.getByTestId("progress-step-1")).toHaveAttribute("data-state", "active");
    const steps = screen.getAllByTestId(/^progress-step-/);
    const doneSteps = steps.filter((s) => s.getAttribute("data-state") === "done");
    expect(doneSteps).toHaveLength(0);
  });

  it("last step shows all previous as done", () => {
    render(<ProgressBar currentStep={6} totalSteps={6} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`progress-step-${i}`)).toHaveAttribute("data-state", "done");
    }
    expect(screen.getByTestId("progress-step-6")).toHaveAttribute("data-state", "active");
  });
});
