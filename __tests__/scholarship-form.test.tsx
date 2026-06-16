import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { ScholarshipForm } from "@/app/(form)/_components/scholarship-form";

const mockSubmitApplication = vi.fn();

vi.mock("@/app/(form)/_actions/form-actions", () => ({
  createSignedUploadUrl: vi.fn().mockResolvedValue({
    url: "https://example.com/upload",
    path: "pending/abc/doc/file.pdf",
  }),
  submitApplication: (...args: unknown[]) => mockSubmitApplication(...args),
}));

function fillStep1() {
  fireEvent.change(screen.getByTestId("escola-select"), {
    target: { value: "colegio_sao_jose" },
  });
  fireEvent.change(screen.getByTestId("pai-nome"), {
    target: { value: "João Silva" },
  });
  fireEvent.change(screen.getByTestId("pai-rg"), {
    target: { value: "12.345.678-9" },
  });
  fireEvent.change(screen.getByTestId("pai-cpf"), {
    target: { value: "529.982.247-25" },
  });
  fireEvent.change(screen.getByTestId("mae-nome"), {
    target: { value: "Maria Silva" },
  });
  fireEvent.change(screen.getByTestId("mae-cpf"), {
    target: { value: "529.982.247-25" },
  });
  fireEvent.change(screen.getByTestId("endereco"), {
    target: { value: "Rua A, 123" },
  });
  fireEvent.change(screen.getByTestId("telefone"), {
    target: { value: "(11) 99999-9999" },
  });
}

function fillStep2() {
  fireEvent.change(screen.getByTestId("aluno-nome-0"), {
    target: { value: "Pedro Silva" },
  });
  fireEvent.change(screen.getByTestId("aluno-mensalidade-0"), {
    target: { value: "1000" },
  });
}

function fillStep3() {
  fireEvent.change(screen.getByTestId("pessoas-domicilio"), {
    target: { value: "4" },
  });
}

function navigateToStep(n: number) {
  fillStep1();
  fireEvent.click(screen.getByTestId("btn-next"));
  if (n <= 2) return;
  fillStep2();
  fireEvent.click(screen.getByTestId("btn-next"));
  if (n <= 3) return;
  fillStep3();
  fireEvent.click(screen.getByTestId("btn-next"));
  if (n <= 4) return;
  fireEvent.click(screen.getByTestId("btn-next"));
  if (n <= 5) return;
  fireEvent.click(screen.getByTestId("btn-next"));
}

describe("ScholarshipForm", () => {
  beforeEach(() => {
    mockSubmitApplication.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders step 1 initially with progress bar at step 1", () => {
    render(<ScholarshipForm />);
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.getByText("1. Dados dos Pais")).toBeInTheDocument();
    expect(screen.getByText("Etapa 1 de 6")).toBeInTheDocument();
  });

  it("validates step 1 required fields before allowing next", () => {
    render(<ScholarshipForm />);
    fireEvent.click(screen.getByTestId("btn-next"));
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.getAllByText("Campo obrigatório").length).toBeGreaterThan(0);
  });

  it("advances to step 2 when step 1 is valid", () => {
    render(<ScholarshipForm />);
    fillStep1();
    fireEvent.click(screen.getByTestId("btn-next"));
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
  });

  it("step 1 dynamic add/remove for other children", () => {
    render(<ScholarshipForm />);
    expect(screen.queryByTestId("remove-child")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("add-child"));
    expect(screen.getByTestId("remove-child")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("remove-child"));
    expect(screen.queryByTestId("remove-child")).not.toBeInTheDocument();
  });

  it("step 2 auto-calculates total tuition from student mensalidade values", () => {
    render(<ScholarshipForm />);
    fillStep1();
    fireEvent.click(screen.getByTestId("btn-next"));

    fireEvent.change(screen.getByTestId("aluno-mensalidade-0"), {
      target: { value: "1500" },
    });
    expect(screen.getByTestId("total-sem")).toHaveTextContent("R$ 1500,00");
  });

  it("step 2 dynamic add/remove for students updates totals", () => {
    render(<ScholarshipForm />);
    fillStep1();
    fireEvent.click(screen.getByTestId("btn-next"));

    fireEvent.change(screen.getByTestId("aluno-mensalidade-0"), {
      target: { value: "1000" },
    });
    fireEvent.click(screen.getByTestId("add-student"));
    fireEvent.change(screen.getByTestId("aluno-mensalidade-1"), {
      target: { value: "800" },
    });
    expect(screen.getByTestId("total-sem")).toHaveTextContent("R$ 1800,00");

    const removeButtons = screen.getAllByTestId("remove-student");
    fireEvent.click(removeButtons[1]);
    expect(screen.getByTestId("total-sem")).toHaveTextContent("R$ 1000,00");
  });

  it("step 3 auto-sums income fields", () => {
    render(<ScholarshipForm />);
    navigateToStep(3);

    fireEvent.change(screen.getByTestId("renda-pai"), {
      target: { value: "3000" },
    });
    fireEvent.change(screen.getByTestId("renda-mae"), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByTestId("renda-outros"), {
      target: { value: "500" },
    });
    expect(screen.getByTestId("total-renda")).toHaveTextContent("R$ 5500,00");
  });

  it("step 4 auto-sums expense fields", () => {
    render(<ScholarshipForm />);
    navigateToStep(4);

    fireEvent.change(screen.getByTestId("desp-aluguel"), {
      target: { value: "1200" },
    });
    fireEvent.change(screen.getByTestId("desp-servicos"), {
      target: { value: "300" },
    });
    expect(screen.getByTestId("total-despesas")).toHaveTextContent(
      "R$ 1500,00"
    );
  });

  it("step 5 dynamic add/remove for vehicles", () => {
    render(<ScholarshipForm />);
    navigateToStep(5);

    expect(screen.queryByTestId("remove-vehicle")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("add-vehicle"));
    expect(screen.getByTestId("remove-vehicle")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("remove-vehicle"));
    expect(screen.queryByTestId("remove-vehicle")).not.toBeInTheDocument();
  });

  it("step 6 renders read-only summary of all entered data", () => {
    render(<ScholarshipForm />);
    navigateToStep(6);

    const summary = screen.getByTestId("review-summary");
    expect(summary).toHaveTextContent("Colégio São José");
    expect(summary).toHaveTextContent("João Silva");
    expect(summary).toHaveTextContent("Maria Silva");
    expect(summary).toHaveTextContent("Rua A, 123");
    expect(summary).toHaveTextContent("Pedro Silva");
  });

  it("step 6 blocks submission if legal declaration checkbox is unchecked", () => {
    render(<ScholarshipForm />);
    navigateToStep(6);

    fireEvent.click(screen.getByTestId("btn-submit"));
    expect(screen.getByTestId("aceite-error")).toBeInTheDocument();
    expect(mockSubmitApplication).not.toHaveBeenCalled();
  });

  it("complete form flow: submit → success screen displayed", async () => {
    mockSubmitApplication.mockResolvedValue({ success: true, id: "test-id" });

    render(<ScholarshipForm />);
    navigateToStep(6);

    fireEvent.click(screen.getByTestId("aceite-checkbox"));
    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("success-screen")).toBeInTheDocument();
    });
    expect(mockSubmitApplication).toHaveBeenCalledTimes(1);
  });

  it("step validation prevents advancing with missing required fields", () => {
    render(<ScholarshipForm />);
    fillStep1();
    fireEvent.click(screen.getByTestId("btn-next"));
    fillStep2();
    fireEvent.click(screen.getByTestId("btn-next"));

    // Step 3 - try to advance without pessoas_domicilio
    fireEvent.click(screen.getByTestId("btn-next"));
    expect(screen.getByTestId("step-3")).toBeInTheDocument();
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });
});
