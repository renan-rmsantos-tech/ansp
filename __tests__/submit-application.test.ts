import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockStorageFrom = vi.fn();
const mockMove = vi.fn().mockResolvedValue({ error: null });

const mockSupabase = {
  from: mockFrom,
  storage: { from: () => ({ move: mockMove }) },
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
  createServiceClient: vi.fn(() => mockSupabase),
}));

vi.mock("crypto", async () => {
  const actual = await vi.importActual<typeof import("crypto")>("crypto");
  return { ...actual, randomUUID: () => "test-uuid-1234" };
});

import { submitApplication } from "@/app/form/_actions/form-actions";

function validInput() {
  return {
    escola: "Colégio São José",
    pai: {
      nome: "João da Silva",
      rg: "12.345.678-9",
      cpf: "529.982.247-25",
      documentos: ["pending/uuid/rg_pai/rg.pdf"],
    },
    mae: {
      nome: "Maria da Silva",
      cpf: "111.444.777-35",
      documentos: ["pending/uuid/rg_mae/rg.pdf"],
    },
    endereco: "Rua das Flores, 123",
    telefone: "(11) 99999-9999",
    comprovante_endereco: ["pending/uuid/comprovante/comp.pdf"],
    outros_filhos: [],
    alunos: [
      {
        nome: "Ana Silva",
        serie: "5º ano",
        mensalidade: 1200,
        documentos: ["pending/uuid/rg_aluno/rg.pdf"],
      },
    ],
    desconto_solicitado: 50,
    renda: { pai: 3000, mae: 2500, pessoas: 4 },
    extrato_ir: ["pending/uuid/extrato_ir/ir.pdf"],
    despesas: { aluguel: 1200 },
    extratos_bancarios: ["pending/uuid/extrato_bancario/ext.pdf"],
    veiculos: [{ marca: "Fiat", modelo: "Uno", ano: "2015" }],
    colaboracao: {
      limpeza: { ativo: true, vezes_semana: 2 },
      arrecadacao: true,
      benfeitores: false,
    },
    indicacao_benfeitores: [
      { nome: "Carlos", email: "carlos@email.com" },
    ],
  };
}

function createTableMock() {
  const insertSelectMock = vi.fn().mockResolvedValue({
    data: [{ id: "student-1", nome: "Ana Silva" }],
    error: null,
  });
  const insertMock = vi.fn().mockReturnValue({
    select: insertSelectMock,
  });

  const singleMock = vi.fn();
  const eqMock = vi.fn().mockReturnValue({ single: singleMock });
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

  return { insert: insertMock, select: selectMock, single: singleMock, eq: eqMock };
}

beforeEach(() => {
  vi.clearAllMocks();

  const tables: Record<string, ReturnType<typeof createTableMock>> = {};

  const getTable = (name: string) => {
    if (!tables[name]) tables[name] = createTableMock();
    return tables[name];
  };

  mockFrom.mockImplementation((table: string) => getTable(table));

  // school_years: SELECT id WHERE ativo = true → { id: "year-1" }
  const syTable = getTable("school_years");
  syTable.single.mockResolvedValue({ data: { id: "year-1" }, error: null });

  // applications: INSERT → SELECT id → single → { id: "app-1" }
  const appTable = getTable("applications");
  const appInsertSelect = vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: { id: "app-1" }, error: null }),
  });
  appTable.insert.mockReturnValue({ select: appInsertSelect });

  // students: INSERT → SELECT → [{ id, nome }]
  const studentsTable = getTable("students");
  studentsTable.insert.mockReturnValue({
    select: vi.fn().mockResolvedValue({
      data: [{ id: "student-1", nome: "Ana Silva" }],
      error: null,
    }),
  });

  // other tables just need insert to resolve
  for (const t of ["other_children", "vehicles", "collaboration", "benefactors", "documents"]) {
    getTable(t).insert.mockResolvedValue({ data: null, error: null });
  }
});

describe("submitApplication", () => {
  it("with valid data creates records in all related tables", async () => {
    const result = await submitApplication(validInput());

    expect(result.success).toBe(true);
    expect(result.id).toBe("app-1");

    // Verify tables were called
    const calledTables = mockFrom.mock.calls.map((c: string[]) => c[0]);
    expect(calledTables).toContain("school_years");
    expect(calledTables).toContain("applications");
    expect(calledTables).toContain("students");
    expect(calledTables).toContain("collaboration");
    expect(calledTables).toContain("documents");
    expect(calledTables).toContain("vehicles");
    expect(calledTables).toContain("benefactors");
  });

  it("with invalid data returns Zod errors without inserting any records", async () => {
    const data = validInput();
    data.pai.nome = "";
    data.pai.cpf = "invalid";
    data.alunos = [];

    const result = await submitApplication(data);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    // Should NOT have called any table
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns error when school year is not active", async () => {
    // Override school_years mock to return no data
    mockFrom.mockImplementation((table: string) => {
      if (table === "school_years") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) };
    });

    const result = await submitApplication(validInput());
    expect(result.success).toBe(false);
    expect(result.errors?._form).toBeDefined();
  });

  it("returns error when application insert fails", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "school_years") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "year-1" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "applications") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "DB error" },
              }),
            }),
          }),
        };
      }
      return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) };
    });

    const result = await submitApplication(validInput());
    expect(result.success).toBe(false);
    expect(result.errors?._form).toBeDefined();
  });
});
