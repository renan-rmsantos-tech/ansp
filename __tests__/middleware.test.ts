import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

import { proxy } from "@/proxy";

function makeRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("proxy", () => {
  it("redirects unauthenticated requests to /admin/solicitacoes → /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await proxy(makeRequest("/admin/solicitacoes"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("redirects unauthenticated requests to /admin → /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await proxy(makeRequest("/admin"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows authenticated requests to /admin/solicitacoes", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "admin@test.com" } },
    });

    const response = await proxy(makeRequest("/admin/solicitacoes"));
    expect(response.status).toBe(200);
  });
});
