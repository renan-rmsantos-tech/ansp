import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";

const {
  mockGetApplicationDetail,
  mockExportDecision,
} = vi.hoisted(() => ({
  mockGetApplicationDetail: vi.fn(),
  mockExportDecision: vi.fn(),
}));

vi.mock("@/app/admin/_actions/admin-actions", () => ({
  getApplicationDetail: mockGetApplicationDetail,
  approveApplication: vi.fn(),
  rejectApplication: vi.fn(),
  exportDecision: mockExportDecision,
  getDocumentUrl: vi.fn(),
}));

import { ApplicationCard, type ApplicationSummary } from "@/app/admin/_components/application-card";

function makeDecidedApp(): ApplicationSummary {
  return {
    id: "app-1",
    status: "aprovada",
    escola: "Colégio São José",
    pai_nome: "João Silva",
    mae_nome: "Maria Silva",
    data_envio: "2026-03-01T10:00:00Z",
    desconto_solicitado: 50,
    desconto_concedido: 40,
    motivo: "Renda insuficiente",
    data_decisao: "2026-03-15T14:00:00Z",
    students: [
      { id: "s1", nome: "Pedro Silva", serie: "5º ano", mensalidade: 1200 },
    ],
  };
}

describe("Export Decision", () => {
  afterEach(cleanup);
  beforeEach(() => vi.clearAllMocks());

  it("export button triggers file download with correct filename", async () => {
    const app = makeDecidedApp();
    const detail = { ...app, other_children: [], vehicles: [], collaboration: null, benefactors: [], documents: [] };
    mockGetApplicationDetail.mockResolvedValueOnce({ data: detail });
    mockExportDecision.mockResolvedValueOnce({
      content: "Decisão de aprovação para João Silva",
      filename: "decisao_aprovacao_João_Silva.txt",
    });

    const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") {
        el.click = mockClick;
      }
      return el;
    });

    render(<ApplicationCard application={app} onDecision={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("card-toggle"));
    });

    const exportButton = screen.getByTestId("export-button");
    expect(exportButton).toBeDefined();
    expect(exportButton.textContent).toBe("Exportar Decisão");

    await act(async () => {
      fireEvent.click(exportButton);
    });

    expect(mockExportDecision).toHaveBeenCalledWith("app-1");
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("export generates .txt content with correctly replaced tokens", async () => {
    const app = makeDecidedApp();
    const detail = { ...app, other_children: [], vehicles: [], collaboration: null, benefactors: [], documents: [] };
    mockGetApplicationDetail.mockResolvedValueOnce({ data: detail });
    mockExportDecision.mockResolvedValueOnce({
      content: "Prezado João Silva e Maria Silva,\n\nAluno(s): Pedro Silva\nDesconto: 40%\n\nColégio São José - 2026",
      filename: "decisao_aprovacao_João_Silva.txt",
    });

    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") el.click = mockClick;
      return el;
    });

    render(<ApplicationCard application={app} onDecision={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("card-toggle"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("export-button"));
    });

    const blobArg = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe("text/plain;charset=utf-8");

    vi.restoreAllMocks();
  });
});
