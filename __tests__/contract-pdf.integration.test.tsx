// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderContractPdf } from "@/lib/pdf/contract-pdf";
import {
  replaceContractTokens,
  SAMPLE_CONTRACT_DATA,
} from "@/lib/templates/contract-tokens";

// Mirrors the structure of the seeded contract (header + clauses + footer with
// signature lines), exercising the real @react-pdf/renderer pipeline in Node.
const TEMPLATE = {
  titulo: "CONTRATO DE CONCESSÃO DE BOLSA DE ESTUDOS",
  cabecalho:
    "PARTES\n\nBENEFICIÁRIO: {aluno}, representado por {nome_responsavel}, RG {rg_responsavel}, CPF {cpf_responsavel}, residente em {endereco}.",
  clausulas: [
    {
      titulo: "CLÁUSULA PRIMEIRA – DO OBJETO",
      corpo:
        "1.1. Bolsa para o ano letivo de {ano_letivo}.\n1.2. Percentual de {desconto}% da mensalidade.",
    },
    {
      titulo: "CLÁUSULA SEGUNDA – DO PRAZO",
      corpo: "2.1. Vigência de {data_inicio} a {data_termino}.",
    },
  ],
  rodape:
    "Por estarem assim justos e contratados.\n\n{data_extenso}\n\n______________________\n{nome_responsavel}",
};

describe("renderContractPdf (integration)", () => {
  it("renders a filled contract into a valid PDF with tokens resolved", async () => {
    const r = (t: string) => replaceContractTokens(t, SAMPLE_CONTRACT_DATA);
    const buf = await renderContractPdf({
      titulo: r(TEMPLATE.titulo),
      cabecalho: r(TEMPLATE.cabecalho),
      clausulas: TEMPLATE.clausulas.map((c) => ({
        titulo: r(c.titulo),
        corpo: r(c.corpo),
      })),
      rodape: r(TEMPLATE.rodape),
    });

    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
