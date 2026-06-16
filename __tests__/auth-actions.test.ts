import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        signInWithPassword: mockSignIn,
        signOut: mockSignOut,
      },
    })
  ),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { login, logout } from "@/app/login/_actions/auth-actions";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("login", () => {
  it("with valid credentials redirects to /admin", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    await expect(login("admin@test.com", "password123")).rejects.toThrow(
      "REDIRECT:/admin"
    );
    expect(mockSignIn).toHaveBeenCalledWith({
      email: "admin@test.com",
      password: "password123",
    });
  });

  it("with invalid credentials returns error", async () => {
    mockSignIn.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const result = await login("wrong@test.com", "wrong");
    expect(result).toEqual({
      error: "Credenciais inválidas. Verifique seu email e senha.",
    });
  });
});

describe("logout", () => {
  it("signs out and redirects to /login", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await expect(logout()).rejects.toThrow("REDIRECT:/login");
    expect(mockSignOut).toHaveBeenCalled();
  });
});
