import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockStorage = vi.fn();

const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
  storage: { from: mockStorage },
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

const mockRenderContractPdf = vi.fn(() => Promise.resolve(Buffer.from("PDF")));
vi.mock("@/lib/pdf/contract-pdf", () => ({
  renderContractPdf: mockRenderContractPdf,
}));

const mockRenderDecisionPdf = vi.fn((_d: unknown) =>
  Promise.resolve(Buffer.from("PDF"))
);
vi.mock("@/lib/pdf/decision-pdf", () => ({
  renderDecisionPdf: mockRenderDecisionPdf,
}));

import {
  getApplications,
  getApplicationDetail,
  getDocumentUrl,
  approveApplication,
  rejectApplication,
  getSchoolYears,
  createSchoolYear,
  toggleSchoolYear,
  deleteSchoolYear,
  getTemplates,
  saveTemplate,
  exportDecision,
  getContractTemplate,
  saveContractTemplate,
  exportContract,
} from "@/app/admin/_actions/admin-actions";

const MOCK_USER = { id: "user-123", email: "admin@test.com" };

function authAs(user = MOCK_USER) {
  mockGetUser.mockResolvedValue({ data: { user } });
}

function authNone() {
  mockGetUser.mockResolvedValue({ data: { user: null } });
}

function chainable(terminal: Record<string, unknown> = {}) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const handler = {
    get(_: unknown, prop: string) {
      if (prop in terminal) {
        const val = terminal[prop];
        return typeof val === "function" ? val : () => val;
      }
      if (!chain[prop]) {
        chain[prop] = vi.fn(() => new Proxy({}, handler));
      }
      return chain[prop];
    },
  };
  return new Proxy({}, handler);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Auth Guard ---

describe("auth guard", () => {
  it("all admin actions reject unauthenticated requests", async () => {
    authNone();

    await expect(getApplications()).rejects.toThrow("Não autorizado");
    await expect(getApplicationDetail("id")).rejects.toThrow("Não autorizado");
    await expect(getDocumentUrl("path")).rejects.toThrow("Não autorizado");
    await expect(approveApplication("id", 50)).rejects.toThrow("Não autorizado");
    await expect(rejectApplication("id")).rejects.toThrow("Não autorizado");
    await expect(getSchoolYears()).rejects.toThrow("Não autorizado");
    await expect(createSchoolYear({ nome: "2026", data_inicio: "2026-01-01", data_fim: "2026-12-31" })).rejects.toThrow("Não autorizado");
    await expect(toggleSchoolYear("id")).rejects.toThrow("Não autorizado");
    await expect(deleteSchoolYear("id")).rejects.toThrow("Não autorizado");
    await expect(getTemplates()).rejects.toThrow("Não autorizado");
    await expect(saveTemplate({ tipo: "aprovacao", cabecalho: "", corpo: "", rodape: "" })).rejects.toThrow("Não autorizado");
    await expect(exportDecision("id")).rejects.toThrow("Não autorizado");
  });
});

// --- getApplications ---

describe("getApplications", () => {
  it("returns applications filtered by status", async () => {
    authAs();
    const apps = [{ id: "1", status: "pendente", students: [] }];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: apps, error: null }),
        }),
      }),
    });

    const result = await getApplications("pendente");
    expect(result.data).toEqual(apps);
    expect(result.error).toBeNull();
  });

  it("returns all applications when no filter", async () => {
    authAs();
    const apps = [
      { id: "1", status: "pendente" },
      { id: "2", status: "aprovada" },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: apps, error: null }),
      }),
    });

    const result = await getApplications();
    expect(result.data).toEqual(apps);
  });
});

// --- getApplicationDetail ---

describe("getApplicationDetail", () => {
  it("returns all nested records for an application", async () => {
    authAs();

    const appData = { id: "app-1", pai_nome: "João", status: "pendente" };
    const students = [{ id: "s1", nome: "Pedro" }];
    const children = [{ id: "c1", nome: "Ana" }];
    const vehicles = [{ id: "v1", marca: "Fiat" }];
    const collab = { id: "col1", limpeza: true };
    const benefactors = [{ id: "b1", nome: "Carlos" }];
    const docs = [{ id: "d1", categoria: "rg_pai" }];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      const makeChain = (resolvedData: unknown, isSingle = false) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(
            isSingle
              ? { single: vi.fn().mockResolvedValue({ data: resolvedData, error: null }) }
              : Promise.resolve({ data: resolvedData, error: null })
          ),
        }),
      });

      if (callCount === 1) return makeChain(appData, true);
      if (callCount === 2) return makeChain(students);
      if (callCount === 3) return makeChain(children);
      if (callCount === 4) return makeChain(vehicles);
      if (callCount === 5) return makeChain(collab, true);
      if (callCount === 6) return makeChain(benefactors);
      if (callCount === 7) return makeChain(docs);
      return makeChain(null);
    });

    const result = await getApplicationDetail("app-1");
    expect(result.data).toBeTruthy();
    expect(result.data!.id).toBe("app-1");
    expect(result.data!.students).toEqual(students);
    expect(result.data!.other_children).toEqual(children);
    expect(result.data!.vehicles).toEqual(vehicles);
    expect(result.data!.collaboration).toEqual(collab);
    expect(result.data!.benefactors).toEqual(benefactors);
    expect(result.data!.documents).toEqual(docs);
  });
});

// --- approveApplication ---

describe("approveApplication", () => {
  it("rejects desconto_concedido outside 0-100 range", async () => {
    authAs();
    const r1 = await approveApplication("id", -1);
    expect(r1.success).toBe(false);
    expect(r1.error).toContain("0 e 100");

    const r2 = await approveApplication("id", 101);
    expect(r2.success).toBe(false);
    expect(r2.error).toContain("0 e 100");
  });

  it("updates status, discount, reason, timestamp, and decided_by", async () => {
    authAs();
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const result = await approveApplication("app-1", 75, "Bom candidato");
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "aprovada",
        desconto_concedido: 75,
        motivo: "Bom candidato",
        decided_by: "user-123",
      })
    );
  });
});

// --- rejectApplication ---

describe("rejectApplication", () => {
  it("updates status, reason, timestamp, and decided_by", async () => {
    authAs();
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const result = await rejectApplication("app-1", "Renda incompatível");
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejeitada",
        motivo: "Renda incompatível",
        decided_by: "user-123",
      })
    );
  });
});

// --- School Years ---

describe("createSchoolYear", () => {
  it("rejects end date before start date", async () => {
    authAs();
    const result = await createSchoolYear({
      nome: "2026",
      data_inicio: "2026-12-31",
      data_fim: "2026-01-01",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Data de fim");
  });

  it("creates school year with valid data", async () => {
    authAs();
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await createSchoolYear({
      nome: "2026",
      data_inicio: "2026-02-01",
      data_fim: "2026-12-15",
    });
    expect(result.success).toBe(true);
  });
});

describe("toggleSchoolYear", () => {
  it("deactivates previously active year when activating a new one", async () => {
    authAs();
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ativo: false },
            error: null,
          }),
        }),
      }),
      update: mockUpdate,
    }));

    const result = await toggleSchoolYear("year-2");
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ ativo: true });
  });
});

describe("deleteSchoolYear", () => {
  it("removes the record", async () => {
    authAs();
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ delete: mockDelete });

    const result = await deleteSchoolYear("year-1");
    expect(result.success).toBe(true);
  });
});

// --- Templates ---

describe("saveTemplate and getTemplates", () => {
  it("saveTemplate persists template", async () => {
    authAs();
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "tmpl-1" },
            error: null,
          }),
        }),
      }),
      update: mockUpdate,
    }));

    const result = await saveTemplate({
      tipo: "aprovacao",
      cabecalho: "Header",
      corpo: "Body {aluno}",
      rodape: "Footer",
    });
    expect(result.success).toBe(true);
  });

  it("saveTemplate creates new template when none exists", async () => {
    authAs();
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
          }),
        }),
      }),
      insert: mockInsert,
    }));

    const result = await saveTemplate({
      tipo: "rejeicao",
      cabecalho: "H",
      corpo: "B",
      rodape: "R",
    });
    expect(result.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it("getTemplates returns templates", async () => {
    authAs();
    const templates = [
      { id: "t1", tipo: "aprovacao" },
      { id: "t2", tipo: "rejeicao" },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: templates, error: null }),
      }),
    });

    const result = await getTemplates();
    expect(result.data).toEqual(templates);
  });
});

// --- Document URL ---

describe("getDocumentUrl", () => {
  it("generates signed download URL", async () => {
    authAs();
    mockStorage.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({
        data: { signedUrl: "https://example.com/signed" },
        error: null,
      }),
    });

    const result = await getDocumentUrl("applications/app-1/rg.pdf");
    expect("url" in result).toBe(true);
    if ("url" in result) {
      expect(result.url).toBe("https://example.com/signed");
    }
  });

  it("falls back to applications path when pending path is stale", async () => {
    authAs();
    const createSignedUrl = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: "not found" } })
      .mockResolvedValueOnce({
        data: { signedUrl: "https://example.com/fallback" },
        error: null,
      });
    mockStorage.mockReturnValue({ createSignedUrl });

    const result = await getDocumentUrl(
      "pending/uuid/rg_pai/rg.pdf",
      "app-1"
    );

    expect(createSignedUrl).toHaveBeenNthCalledWith(
      1,
      "pending/uuid/rg_pai/rg.pdf",
      300
    );
    expect(createSignedUrl).toHaveBeenNthCalledWith(
      2,
      "applications/app-1/rg_pai/rg.pdf",
      300
    );
    expect("url" in result).toBe(true);
    if ("url" in result) {
      expect(result.url).toBe("https://example.com/fallback");
    }
  });
});

// --- Export Decision ---

describe("exportDecision", () => {
  it("returns a PDF with all tokens replaced", async () => {
    authAs();
    mockRenderDecisionPdf.mockClear();

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "app-1",
                  status: "aprovada",
                  pai_nome: "João Silva",
                  mae_nome: "Maria Silva",
                  escola: "Colégio São José",
                  desconto_concedido: 50,
                  motivo: "Renda compatível",
                  data_decisao: "2026-06-15T12:00:00Z",
                  students: [{ nome: "Pedro" }, { nome: "Ana" }],
                  school_years: { nome: "2026" },
                },
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "tmpl-1",
                tipo: "aprovacao",
                cabecalho: "DECISÃO - {escola}",
                corpo: "Comunicamos que a solicitação de {nome_pai} e {nome_mae} para o(s) aluno(s) {aluno} foi aprovada com desconto de {desconto}%. Motivo: {motivo}.",
                rodape: "Data: {data} - Ano Letivo: {ano_letivo}",
              },
              error: null,
            }),
          }),
        }),
      };
    });

    const result = await exportDecision("app-1");
    expect("pdfBase64" in result).toBe(true);
    if ("pdfBase64" in result) {
      expect(result.pdfBase64).toBe(Buffer.from("PDF").toString("base64"));
      expect(result.filename).toMatch(/^decisao_aprovacao_.*\.pdf$/);
    }

    expect(mockRenderDecisionPdf).toHaveBeenCalledTimes(1);
    const resolved = mockRenderDecisionPdf.mock.calls[0][0] as {
      cabecalho: string;
      corpo: string;
      rodape: string;
    };
    const fullText = [resolved.cabecalho, resolved.corpo, resolved.rodape].join("\n");
    expect(fullText).toContain("João Silva");
    expect(fullText).toContain("Maria Silva");
    expect(fullText).toContain("Colégio São José");
    expect(fullText).toContain("Pedro, Ana");
    expect(fullText).toContain("50");
    expect(fullText).toContain("Renda compatível");
    expect(fullText).toContain("2026");
  });

  it("rejects export for pending applications", async () => {
    authAs();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "app-1", status: "pendente" },
            error: null,
          }),
        }),
      }),
    });

    const result = await exportDecision("app-1");
    expect("error" in result).toBe(true);
  });
});

describe("getContractTemplate and saveContractTemplate", () => {
  it("returns the contract template", async () => {
    authAs();
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "ct-1",
                titulo: "CONTRATO",
                cabecalho: "{aluno}",
                clausulas: [{ titulo: "C1", corpo: "x" }],
                rodape: "{data_extenso}",
              },
              error: null,
            }),
          }),
        }),
      }),
    }));

    const result = await getContractTemplate();
    expect(result.error).toBeNull();
    expect(result.data?.titulo).toBe("CONTRATO");
    expect(result.data?.clausulas).toHaveLength(1);
  });

  it("updates an existing template", async () => {
    authAs();
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: "ct-1" },
              error: null,
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({ eq: updateEq }),
    }));

    const result = await saveContractTemplate({
      titulo: "T",
      cabecalho: "C",
      clausulas: [],
      rodape: "R",
    });
    expect(result.success).toBe(true);
    expect(updateEq).toHaveBeenCalledWith("id", "ct-1");
  });

  it("inserts when no template exists", async () => {
    authAs();
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      insert,
    }));

    const result = await saveContractTemplate({
      titulo: "T",
      cabecalho: "C",
      clausulas: [],
      rodape: "R",
    });
    expect(result.success).toBe(true);
    expect(insert).toHaveBeenCalled();
  });
});

describe("exportContract", () => {
  function mockApprovedAppAndTemplate() {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // applications
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "app-1",
                  status: "aprovada",
                  pai_nome: "João Silva",
                  pai_rg: "12.345.678-9",
                  pai_cpf: "123.456.789-00",
                  endereco: "Rua A, 123",
                  cep: "13250-000",
                  desconto_concedido: 50,
                  students: [{ nome: "Pedro" }, { nome: "Ana" }],
                  school_years: {
                    nome: "2026",
                    data_inicio: "2026-02-01",
                    data_fim: "2026-11-30",
                  },
                },
                error: null,
              }),
            }),
          }),
        };
      }
      // contract_templates (getContractTemplate)
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: "ct-1",
                  titulo: "CONTRATO",
                  cabecalho: "Aluno: {aluno}, CPF {cpf_responsavel}, end {endereco}",
                  clausulas: [
                    { titulo: "C1", corpo: "Bolsa {desconto}% de {data_inicio} a {data_termino}" },
                  ],
                  rodape: "{data_extenso}",
                },
                error: null,
              }),
            }),
          }),
        }),
      };
    });
  }

  it("generates a PDF with resolved tokens for an approved application", async () => {
    authAs();
    mockApprovedAppAndTemplate();

    const result = await exportContract("app-1");
    expect("pdfBase64" in result).toBe(true);
    if ("pdfBase64" in result) {
      expect(result.filename).toMatch(/^contrato_.*\.pdf$/);
      expect(result.pdfBase64).toBe(Buffer.from("PDF").toString("base64"));
    }

    // tokens were resolved before rendering
    expect(mockRenderContractPdf).toHaveBeenCalledTimes(1);
    const resolved = mockRenderContractPdf.mock.calls[0][0] as {
      cabecalho: string;
      clausulas: { corpo: string }[];
    };
    expect(resolved.cabecalho).toContain("Pedro, Ana");
    expect(resolved.cabecalho).toContain("123.456.789-00");
    expect(resolved.cabecalho).toContain("CEP 13250-000");
    expect(resolved.clausulas[0].corpo).toContain("50%");
    expect(resolved.clausulas[0].corpo).toContain("01/02/2026");
    expect(resolved.clausulas[0].corpo).toContain("30/11/2026");
  });

  it("rejects contract generation for non-approved applications", async () => {
    authAs();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "app-1", status: "pendente" },
            error: null,
          }),
        }),
      }),
    });

    const result = await exportContract("app-1");
    expect("error" in result).toBe(true);
    expect(mockRenderContractPdf).not.toHaveBeenCalled();
  });
});
