import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();
const mockCreateSignedUploadUrl = vi.fn();
const mockMove = vi.fn();
const mockStorage = vi.fn();

const mockSupabase = {
  from: mockFrom,
  storage: { from: mockStorage },
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));


import {
  getActiveSchoolYear,
  createSignedUploadUrl,
} from "@/app/(form)/_actions/form-actions";

beforeEach(() => {
  vi.clearAllMocks();

  mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ single: mockSingle });
  mockStorage.mockReturnValue({
    createSignedUploadUrl: mockCreateSignedUploadUrl,
    move: mockMove,
  });
});

describe("getActiveSchoolYear", () => {
  it("returns { open: false } when no active school year exists", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });

    const result = await getActiveSchoolYear();
    expect(result).toEqual({ open: false });
  });

  it("returns { open: false } when active year dates are outside current date", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "year-1",
        nome: "2025",
        data_inicio: "2025-01-01",
        data_fim: "2025-12-31",
        ativo: true,
      },
      error: null,
    });

    const result = await getActiveSchoolYear();
    expect(result).toEqual({ open: false });
  });

  it("returns { open: true, year } when active year is current", async () => {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);

    const yearData = {
      id: "year-1",
      nome: "2026",
      data_inicio: start.toISOString().split("T")[0],
      data_fim: end.toISOString().split("T")[0],
      ativo: true,
    };

    mockSingle.mockResolvedValue({ data: yearData, error: null });

    const result = await getActiveSchoolYear();
    expect(result.open).toBe(true);
    expect(result.year).toEqual(yearData);
  });
});

describe("createSignedUploadUrl", () => {
  it("generates a URL with correct path prefix pending/{uuid}/", async () => {
    mockCreateSignedUploadUrl.mockResolvedValue({
      data: { signedUrl: "https://storage.example.com/signed" },
      error: null,
    });

    const result = await createSignedUploadUrl("doc.pdf", "rg_pai");
    expect("url" in result).toBe(true);
    if ("url" in result) {
      expect(result.url).toBe("https://storage.example.com/signed");
      expect(result.path).toMatch(/^pending\/[0-9a-f-]+\/rg_pai\/doc\.pdf$/);
    }
  });

  it("sanitizes filenames", async () => {
    mockCreateSignedUploadUrl.mockResolvedValue({
      data: { signedUrl: "https://storage.example.com/signed" },
      error: null,
    });

    const result = await createSignedUploadUrl("my file (1).pdf", "rg_pai");
    expect("path" in result).toBe(true);
    if ("path" in result) {
      expect(result.path).toMatch(/^pending\/[0-9a-f-]+\/rg_pai\/my_file__1_\.pdf$/);
    }
  });

  it("returns error when Supabase fails", async () => {
    mockCreateSignedUploadUrl.mockResolvedValue({
      data: null,
      error: { message: "Storage error" },
    });

    const result = await createSignedUploadUrl("doc.pdf", "rg_pai");
    expect("error" in result).toBe(true);
  });
});
