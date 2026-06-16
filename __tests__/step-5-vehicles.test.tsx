import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Step5Vehicles } from "@/app/(form)/_components/step-5-vehicles";
import { INITIAL_FORM_DATA } from "@/app/(form)/_components/form-types";
import type { FormData } from "@/app/(form)/_components/form-types";

vi.mock("@/app/(form)/_actions/form-actions", () => ({
  createSignedUploadUrl: vi.fn(),
}));

function renderStep5(overrides: Partial<FormData> = {}) {
  const data = { ...INITIAL_FORM_DATA, ...overrides };
  const onChange = vi.fn();
  render(<Step5Vehicles data={data} onChange={onChange} errors={{}} />);
  return { onChange, data };
}

describe("Step5Vehicles", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders vehicle section", () => {
    renderStep5();
    expect(screen.getByText("Veículos da Família")).toBeInTheDocument();
  });

  it("adds a vehicle", () => {
    const { onChange } = renderStep5();
    fireEvent.click(screen.getByTestId("add-vehicle"));
    expect(onChange).toHaveBeenCalledWith({
      veiculos: [{ marca: "", modelo: "", ano: "" }],
    });
  });

  it("removes a vehicle", () => {
    const { onChange } = renderStep5({
      veiculos: [
        { marca: "Fiat", modelo: "Uno", ano: "2020" },
        { marca: "VW", modelo: "Gol", ano: "2019" },
      ],
    });
    const removeButtons = screen.getAllByTestId("remove-vehicle");
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith({
      veiculos: [{ marca: "VW", modelo: "Gol", ano: "2019" }],
    });
  });

  it("updates a vehicle field", () => {
    const { onChange } = renderStep5({
      veiculos: [{ marca: "", modelo: "", ano: "" }],
    });
    const inputs = screen.getAllByPlaceholderText("Marca");
    fireEvent.change(inputs[0], { target: { value: "Toyota" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("renders collaboration checkboxes", () => {
    renderStep5();
    expect(screen.getByLabelText("Limpeza")).toBeInTheDocument();
    expect(screen.getByLabelText("Mutirão")).toBeInTheDocument();
    expect(screen.getByLabelText("Arrecadação")).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar benfeitores")).toBeInTheDocument();
  });

  it("toggles limpeza and shows vezes_semana input", () => {
    const { onChange } = renderStep5();
    fireEvent.click(screen.getByLabelText("Limpeza"));
    expect(onChange).toHaveBeenCalledWith({
      colaboracao: expect.objectContaining({ limpeza: true }),
    });
  });

  it("shows vezes_semana input when limpeza is active", () => {
    renderStep5({
      colaboracao: {
        ...INITIAL_FORM_DATA.colaboracao,
        limpeza: true,
      },
    });
    expect(screen.getByPlaceholderText("Vezes por semana")).toBeInTheDocument();
  });

  it("toggles mutirao and shows sabados input when active", () => {
    renderStep5({
      colaboracao: {
        ...INITIAL_FORM_DATA.colaboracao,
        mutirao: true,
      },
    });
    expect(screen.getByPlaceholderText("Sábados por mês")).toBeInTheDocument();
  });

  it("renders 10 benefactor rows", () => {
    renderStep5();
    expect(screen.getByTestId("benfeitores-list")).toBeInTheDocument();
    const nameInputs = screen.getAllByPlaceholderText("Nome");
    expect(nameInputs.length).toBeGreaterThanOrEqual(10);
  });

  it("updates benefactor name", () => {
    const { onChange } = renderStep5();
    const nameInputs = screen.getAllByPlaceholderText("Nome");
    fireEvent.change(nameInputs[0], { target: { value: "Carlos" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("updates benefactor email", () => {
    const { onChange } = renderStep5();
    const emailInputs = screen.getAllByPlaceholderText("email@exemplo.com");
    fireEvent.change(emailInputs[0], {
      target: { value: "carlos@test.com" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("updates colaboracao outros text field", () => {
    const { onChange } = renderStep5();
    const outrosInput = screen.getByLabelText("Outros:");
    fireEvent.change(outrosInput, { target: { value: "Cozinha" } });
    expect(onChange).toHaveBeenCalledWith({
      colaboracao: expect.objectContaining({ outros: "Cozinha" }),
    });
  });

  it("toggles arrecadacao checkbox", () => {
    const { onChange } = renderStep5();
    fireEvent.click(screen.getByLabelText("Arrecadação"));
    expect(onChange).toHaveBeenCalledWith({
      colaboracao: expect.objectContaining({ arrecadacao: true }),
    });
  });

  it("toggles benfeitores checkbox", () => {
    const { onChange } = renderStep5();
    fireEvent.click(screen.getByLabelText("Buscar benfeitores"));
    expect(onChange).toHaveBeenCalledWith({
      colaboracao: expect.objectContaining({ benfeitores: true }),
    });
  });

  it("updates limpeza_vezes_semana when input changes", () => {
    const { onChange } = renderStep5({
      colaboracao: {
        ...INITIAL_FORM_DATA.colaboracao,
        limpeza: true,
      },
    });
    fireEvent.change(screen.getByPlaceholderText("Vezes por semana"), {
      target: { value: "3" },
    });
    expect(onChange).toHaveBeenCalledWith({
      colaboracao: expect.objectContaining({ limpeza_vezes_semana: "3" }),
    });
  });

  it("updates mutirao_sabados when input changes", () => {
    const { onChange } = renderStep5({
      colaboracao: {
        ...INITIAL_FORM_DATA.colaboracao,
        mutirao: true,
      },
    });
    fireEvent.change(screen.getByPlaceholderText("Sábados por mês"), {
      target: { value: "2" },
    });
    expect(onChange).toHaveBeenCalledWith({
      colaboracao: expect.objectContaining({ mutirao_sabados: "2" }),
    });
  });
});
