import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import LoginPage from "@/app/login/page";

const mockLogin = vi.fn();
vi.mock("@/app/login/_actions/auth-actions", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));

vi.mock("@/components/ui/seal-logo", () => ({
  SealLogo: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="seal-logo" data-size={size} className={className} />
  ),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
  });

  it("renders the seal logo", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("seal-logo")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("displays error message when login action returns error", async () => {
    mockLogin.mockResolvedValue({
      error: "Credenciais inválidas. Verifique seu email e senha.",
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Credenciais inválidas"
      );
    });
  });

  it("clears error when user types in email field", async () => {
    mockLogin.mockResolvedValue({ error: "Credenciais inválidas." });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@test.com" },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows loading state during submission", async () => {
    let resolveLogin: (value: unknown) => void;
    mockLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Entrando…" })
      ).toBeDisabled();
    });

    resolveLogin!({ error: null });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    });
  });

  it("calls login action with email and password", async () => {
    mockLogin.mockResolvedValue({});

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@ansp.org" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@ansp.org", "secret123");
    });
  });
});
