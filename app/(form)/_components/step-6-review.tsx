"use client";

import type { FormData } from "./form-types";
import { parseMoney, formatMoney } from "./form-types";
import { useMemo } from "react";

interface Step6Props {
  data: FormData;
  accepted: boolean;
  onAcceptedChange: (v: boolean) => void;
  acceptError: boolean;
}

const ESCOLA_LABELS: Record<string, string> = {
  colegio_sao_jose: "Colégio São José",
  escola_santa_catarina: "Escola Santa Catarina",
  escola_nossa_senhora: "Escola Nossa Senhora da Providência",
};

export function Step6Review({
  data,
  accepted,
  onAcceptedChange,
  acceptError,
}: Step6Props) {
  const totalRenda = useMemo(
    () =>
      parseMoney(data.renda_pai) +
      parseMoney(data.renda_mae) +
      parseMoney(data.renda_outros),
    [data.renda_pai, data.renda_mae, data.renda_outros]
  );

  const totalDespesas = useMemo(
    () =>
      parseMoney(data.despesa_aluguel) +
      parseMoney(data.despesa_servicos) +
      parseMoney(data.despesa_tv) +
      parseMoney(data.despesa_celular_plano) +
      parseMoney(data.despesa_celular_parcelas) +
      parseMoney(data.despesa_internet),
    [
      data.despesa_aluguel,
      data.despesa_servicos,
      data.despesa_tv,
      data.despesa_celular_plano,
      data.despesa_celular_parcelas,
      data.despesa_internet,
    ]
  );

  const totalMensalidade = useMemo(
    () => data.alunos.reduce((s, a) => s + parseMoney(a.mensalidade), 0),
    [data.alunos]
  );

  const pct = parseMoney(data.desconto_solicitado);
  const totalComDesconto = totalMensalidade * (1 - Math.min(pct, 100) / 100);

  return (
    <div data-testid="step-6">
      <div className="rounded-lg border border-border bg-surface p-8 max-sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Revisão e Declaração
        </h2>
        <p className="mb-6 text-sm text-muted">
          Revise as informações antes de enviar. Ao submeter, você declara sob
          juramento que todas as informações são verdadeiras.
        </p>

        <div
          className="space-y-1 text-sm leading-relaxed"
          data-testid="review-summary"
        >
          <p>
            <strong>Escola:</strong>{" "}
            {ESCOLA_LABELS[data.escola] || data.escola || "—"}
          </p>
          <p>
            <strong>Pai:</strong> {data.pai_nome || "—"} · RG:{" "}
            {data.pai_rg || "—"} · CPF: {data.pai_cpf || "—"}
          </p>
          <p>
            <strong>Mãe:</strong> {data.mae_nome || "—"} · CPF:{" "}
            {data.mae_cpf || "—"}
          </p>
          <p>
            <strong>Endereço:</strong> {data.endereco || "—"}
          </p>
          <p>
            <strong>Telefone:</strong> {data.telefone || "—"}
          </p>

          {data.alunos.length > 0 && (
            <div className="mt-3">
              <strong>Alunos:</strong>
              <ul className="ml-4 list-disc">
                {data.alunos.map((a, i) => (
                  <li key={i}>
                    {a.nome || "—"} — {a.serie || "—"} — {a.mensalidade ? formatMoney(parseMoney(a.mensalidade)) : "—"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-3">
            <strong>Renda total:</strong> {formatMoney(totalRenda)}
          </p>
          <p>
            <strong>Despesas totais:</strong> {formatMoney(totalDespesas)}
          </p>
          <p>
            <strong>Mensalidade total:</strong>{" "}
            {formatMoney(totalMensalidade)}
          </p>
          <p>
            <strong>Desconto solicitado:</strong>{" "}
            {data.desconto_solicitado || "—"}%
          </p>
          <p>
            <strong>Total com desconto:</strong>{" "}
            {formatMoney(totalComDesconto)}
          </p>

          {data.veiculos.length > 0 && (
            <div className="mt-3">
              <strong>Veículos:</strong>
              <ul className="ml-4 list-disc">
                {data.veiculos.map((v, i) => (
                  <li key={i}>
                    {v.marca} {v.modelo} ({v.ano})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="my-6 h-px bg-border" />

        <div
          className={`flex items-start gap-2.5 ${acceptError ? "animate-shake" : ""}`}
          data-testid="aceite-container"
        >
          <input
            type="checkbox"
            id="aceite"
            checked={accepted}
            onChange={(e) => onAcceptedChange(e.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-accent"
            data-testid="aceite-checkbox"
          />
          <label
            htmlFor="aceite"
            className={`cursor-pointer text-[13px] ${acceptError ? "text-danger" : "text-muted"}`}
          >
            Declaro que todas as informações prestadas são verdadeiras e estou
            ciente das condições de concessão, validade e compromisso de
            colaboração da bolsa. <span className="text-danger">*</span>
          </label>
        </div>
        {acceptError && (
          <p className="mt-1 text-xs text-danger" data-testid="aceite-error">
            Você deve aceitar a declaração para enviar.
          </p>
        )}
      </div>
    </div>
  );
}
