import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

const mockLogout = vi.fn();
vi.mock("@/app/login/_actions/auth-actions", () => ({
  logout: () => mockLogout(),
}));

vi.mock("@/components/ui/seal-logo", () => ({
  SealLogo: ({ size }: { size?: number }) => (
    <svg data-testid="topbar-seal" data-size={size} />
  ),
}));

import { Topbar } from "@/app/admin/_components/topbar";

describe("Topbar", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders logo and title", () => {
    render(<Topbar />);
    expect(screen.getByTestId("topbar-seal")).toBeInTheDocument();
    expect(screen.getByText("Arca N. S. da Providência")).toBeInTheDocument();
    expect(screen.getByText("Administração")).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(<Topbar />);
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("calls logout action when button clicked", async () => {
    mockLogout.mockResolvedValue(undefined);
    render(<Topbar />);
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
