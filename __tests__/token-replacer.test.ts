import { describe, it, expect } from "vitest";
import { replaceTokens, type TokenData } from "@/lib/templates/token-replacer";

function makeTokenData(overrides?: Partial<TokenData>): TokenData {
  return {
    nome_pai: "João Silva",
    nome_mae: "Maria Silva",
    escola: "Colégio São José",
    alunos: ["Pedro Silva"],
    desconto: "50",
    data: "15/06/2026",
    motivo: "Renda familiar compatível",
    ano_letivo: "2026",
    ...overrides,
  };
}

describe("replaceTokens", () => {
  it("replaces all 8 tokens correctly", () => {
    const template =
      "Pai: {nome_pai}, Mãe: {nome_mae}, Escola: {escola}, Aluno: {aluno}, Desconto: {desconto}%, Data: {data}, Motivo: {motivo}, Ano: {ano_letivo}";
    const result = replaceTokens(template, makeTokenData());

    expect(result).toBe(
      "Pai: João Silva, Mãe: Maria Silva, Escola: Colégio São José, Aluno: Pedro Silva, Desconto: 50%, Data: 15/06/2026, Motivo: Renda familiar compatível, Ano: 2026"
    );
  });

  it("handles missing optional motivo as empty string", () => {
    const template = "Motivo: {motivo}.";
    const result = replaceTokens(template, makeTokenData({ motivo: null }));
    expect(result).toBe("Motivo: .");
  });

  it("handles undefined motivo as empty string", () => {
    const template = "Motivo: {motivo}.";
    const result = replaceTokens(template, makeTokenData({ motivo: undefined }));
    expect(result).toBe("Motivo: .");
  });

  it("handles multiple students as comma-separated list", () => {
    const template = "Aluno(s): {aluno}";
    const result = replaceTokens(
      template,
      makeTokenData({ alunos: ["Pedro Silva", "Ana Silva", "Carlos Silva"] })
    );
    expect(result).toBe("Aluno(s): Pedro Silva, Ana Silva, Carlos Silva");
  });

  it("handles single student", () => {
    const template = "{aluno}";
    const result = replaceTokens(template, makeTokenData({ alunos: ["Pedro"] }));
    expect(result).toBe("Pedro");
  });

  it("replaces multiple occurrences of the same token", () => {
    const template = "{nome_pai} e {nome_pai}";
    const result = replaceTokens(template, makeTokenData());
    expect(result).toBe("João Silva e João Silva");
  });

  it("preserves text with no tokens", () => {
    const template = "Texto sem tokens.";
    const result = replaceTokens(template, makeTokenData());
    expect(result).toBe("Texto sem tokens.");
  });

  it("handles empty alunos array", () => {
    const template = "Aluno: {aluno}";
    const result = replaceTokens(template, makeTokenData({ alunos: [] }));
    expect(result).toBe("Aluno: ");
  });
});
