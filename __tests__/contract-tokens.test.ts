import { describe, it, expect } from "vitest";
import {
  replaceContractTokens,
  formatDataExtenso,
  AVAILABLE_CONTRACT_TOKENS,
  type ContractTokenData,
} from "@/lib/templates/contract-tokens";

function makeData(overrides?: Partial<ContractTokenData>): ContractTokenData {
  return {
    aluno: "Pedro Silva",
    nome_responsavel: "João Silva",
    rg_responsavel: "12.345.678-9",
    cpf_responsavel: "123.456.789-00",
    endereco: "Rua A, 123, Itatiba - SP",
    desconto: "50",
    ano_letivo: "2026",
    data_inicio: "01/02/2026",
    data_termino: "30/11/2026",
    data_extenso: "Itatiba - SP, 17 de junho de 2026",
    ...overrides,
  };
}

describe("replaceContractTokens", () => {
  it("replaces every available token", () => {
    const template = AVAILABLE_CONTRACT_TOKENS.map((t) => t.token).join(" | ");
    const result = replaceContractTokens(template, makeData());

    expect(result).toBe(
      "Pedro Silva | João Silva | 12.345.678-9 | 123.456.789-00 | Rua A, 123, Itatiba - SP | 50 | 2026 | 01/02/2026 | 30/11/2026 | Itatiba - SP, 17 de junho de 2026"
    );
    expect(result).not.toMatch(/\{[a-z_]+\}/);
  });

  it("replaces multiple occurrences of the same token", () => {
    const result = replaceContractTokens("{aluno} e {aluno}", makeData());
    expect(result).toBe("Pedro Silva e Pedro Silva");
  });

  it("preserves text without tokens", () => {
    const result = replaceContractTokens("Cláusula sem tokens.", makeData());
    expect(result).toBe("Cláusula sem tokens.");
  });

  it("handles joined student names", () => {
    const result = replaceContractTokens(
      "{aluno}",
      makeData({ aluno: "Pedro Silva, Ana Silva" })
    );
    expect(result).toBe("Pedro Silva, Ana Silva");
  });
});

describe("formatDataExtenso", () => {
  it("formats a date in Portuguese with default city", () => {
    expect(formatDataExtenso(new Date(2026, 5, 17))).toBe(
      "Itatiba - SP, 17 de junho de 2026"
    );
  });

  it("accepts a custom city/UF", () => {
    expect(formatDataExtenso(new Date(2026, 0, 5), "São Paulo - SP")).toBe(
      "São Paulo - SP, 5 de janeiro de 2026"
    );
  });
});
