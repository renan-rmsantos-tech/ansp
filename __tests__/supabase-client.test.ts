import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  })),
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  })),
}));

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-anon-key");

describe("Supabase browser client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates successfully with mock env vars", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });
});

describe("Supabase server client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates successfully with mock env vars", async () => {
    vi.mock("next/headers", () => ({
      cookies: vi.fn(() =>
        Promise.resolve({
          getAll: vi.fn(() => []),
          set: vi.fn(),
        })
      ),
    }));

    const { createClient } = await import("@/lib/supabase/server");
    const client = await createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });
});
