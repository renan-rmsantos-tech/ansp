"use client";

import { useState, useCallback, useMemo } from "react";
import { saveContractTemplate, type ContractTemplate } from "../_actions/admin-actions";
import {
  AVAILABLE_CONTRACT_TOKENS,
  replaceContractTokens,
  SAMPLE_CONTRACT_DATA,
  type ContractClause,
} from "@/lib/templates/contract-tokens";

interface ContractTemplateEditorProps {
  initialTemplate: ContractTemplate | null;
}

const EMPTY = {
  titulo: "CONTRATO DE CONCESSÃO DE BOLSA DE ESTUDOS",
  cabecalho: "",
  clausulas: [] as ContractClause[],
  rodape: "",
};

export function ContractTemplateEditor({
  initialTemplate,
}: ContractTemplateEditorProps) {
  const [titulo, setTitulo] = useState(initialTemplate?.titulo ?? EMPTY.titulo);
  const [cabecalho, setCabecalho] = useState(
    initialTemplate?.cabecalho ?? EMPTY.cabecalho
  );
  const [clausulas, setClausulas] = useState<ContractClause[]>(
    initialTemplate?.clausulas ?? EMPTY.clausulas
  );
  const [rodape, setRodape] = useState(initialTemplate?.rodape ?? EMPTY.rodape);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const clearMessage = useCallback(() => setMessage(null), []);

  const updateClause = useCallback(
    (index: number, field: keyof ContractClause, value: string) => {
      setClausulas((prev) =>
        prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
      );
      clearMessage();
    },
    [clearMessage]
  );

  const addClause = useCallback(() => {
    setClausulas((prev) => [...prev, { titulo: "", corpo: "" }]);
    clearMessage();
  }, [clearMessage]);

  const removeClause = useCallback(
    (index: number) => {
      setClausulas((prev) => prev.filter((_, i) => i !== index));
      clearMessage();
    },
    [clearMessage]
  );

  const moveClause = useCallback(
    (index: number, dir: -1 | 1) => {
      setClausulas((prev) => {
        const next = [...prev];
        const target = index + dir;
        if (target < 0 || target >= next.length) return prev;
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
      clearMessage();
    },
    [clearMessage]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    const result = await saveContractTemplate({
      titulo,
      cabecalho,
      clausulas,
      rodape,
    });
    if (result.success) {
      setMessage({ type: "success", text: "Modelo de contrato salvo com sucesso." });
    } else {
      setMessage({
        type: "error",
        text: result.error ?? "Erro ao salvar modelo.",
      });
    }
    setSaving(false);
  }, [titulo, cabecalho, clausulas, rodape]);

  const preview = useMemo(() => {
    const r = (t: string) => replaceContractTokens(t, SAMPLE_CONTRACT_DATA);
    return {
      titulo: r(titulo),
      cabecalho: r(cabecalho),
      clausulas: clausulas.map((c) => ({
        titulo: r(c.titulo),
        corpo: r(c.corpo),
      })),
      rodape: r(rodape),
    };
  }, [titulo, cabecalho, clausulas, rodape]);

  const fieldClass =
    "w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const labelClass = "mb-1 block text-xs font-medium text-muted";

  return (
    <div data-testid="contract-template-editor">
      {/* Token reference */}
      <div
        className="mb-4 rounded-lg border border-border bg-cream p-4"
        data-testid="contract-token-reference"
      >
        <h3 className="mb-2 text-sm font-medium text-muted">
          Tokens disponíveis
        </h3>
        <p className="mb-3 text-xs text-muted">
          Serão substituídos pelos dados da família ao gerar o contrato em PDF.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {AVAILABLE_CONTRACT_TOKENS.map((t) => (
            <li
              key={t.token}
              className="flex items-start gap-2 rounded-md bg-bg px-2 py-1.5 text-xs"
              data-testid="contract-token-item"
            >
              <code className="shrink-0 font-mono text-fg">{t.token}</code>
              <span className="text-muted">{t.desc}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4">
          <div>
            <label htmlFor="ct-titulo" className={labelClass}>
              Título
            </label>
            <input
              id="ct-titulo"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                clearMessage();
              }}
              className={fieldClass}
              data-testid="field-titulo"
            />
          </div>

          <div>
            <label htmlFor="ct-cabecalho" className={labelClass}>
              Cabeçalho (partes)
            </label>
            <textarea
              id="ct-cabecalho"
              value={cabecalho}
              onChange={(e) => {
                setCabecalho(e.target.value);
                clearMessage();
              }}
              rows={6}
              className={fieldClass}
              data-testid="field-cabecalho"
            />
          </div>

          {/* Clauses */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className={labelClass + " mb-0"}>Cláusulas</span>
              <button
                type="button"
                onClick={addClause}
                className="rounded-md border border-border px-2 py-1 text-xs font-medium text-accent hover:bg-bg"
                data-testid="add-clause"
              >
                + Adicionar cláusula
              </button>
            </div>
            <div className="space-y-3" data-testid="clauses-list">
              {clausulas.length === 0 && (
                <p className="text-sm text-muted">Nenhuma cláusula adicionada.</p>
              )}
              {clausulas.map((clause, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border bg-surface p-3"
                  data-testid={`clause-${i}`}
                >
                  <div className="mb-2 flex items-center gap-1">
                    <input
                      value={clause.titulo}
                      onChange={(e) => updateClause(i, "titulo", e.target.value)}
                      placeholder="Título da cláusula"
                      className={fieldClass + " flex-1"}
                      data-testid={`clause-titulo-${i}`}
                    />
                    <button
                      type="button"
                      onClick={() => moveClause(i, -1)}
                      disabled={i === 0}
                      className="rounded border border-border px-2 py-1 text-xs text-muted hover:bg-bg disabled:opacity-30"
                      aria-label="Mover para cima"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveClause(i, 1)}
                      disabled={i === clausulas.length - 1}
                      className="rounded border border-border px-2 py-1 text-xs text-muted hover:bg-bg disabled:opacity-30"
                      aria-label="Mover para baixo"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeClause(i)}
                      className="rounded border border-border px-2 py-1 text-xs text-danger hover:bg-bg"
                      data-testid={`remove-clause-${i}`}
                      aria-label="Remover cláusula"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={clause.corpo}
                    onChange={(e) => updateClause(i, "corpo", e.target.value)}
                    placeholder="Texto da cláusula"
                    rows={4}
                    className={fieldClass}
                    data-testid={`clause-corpo-${i}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="ct-rodape" className={labelClass}>
              Rodapé (fecho e assinaturas)
            </label>
            <textarea
              id="ct-rodape"
              value={rodape}
              onChange={(e) => {
                setRodape(e.target.value);
                clearMessage();
              }}
              rows={6}
              className={fieldClass}
              data-testid="field-rodape"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-success" : "text-danger"
              }`}
              data-testid="contract-save-message"
            >
              {message.text}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
              data-testid="save-contract-button"
            >
              {saving ? "Salvando..." : "Salvar Modelo"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div
          className="rounded-lg border border-border bg-cream p-6"
          data-testid="contract-preview"
        >
          <h3 className="mb-3 text-sm font-semibold text-fg">
            Pré-visualização
          </h3>
          <div className="text-sm leading-relaxed text-fg">
            <p className="mb-4 text-center text-sm font-semibold">
              {preview.titulo}
            </p>
            <div className="whitespace-pre-wrap">{preview.cabecalho}</div>
            {preview.clausulas.map((c, i) => (
              <div key={i} className="mt-3">
                <p className="font-semibold">{c.titulo}</p>
                <div className="whitespace-pre-wrap">{c.corpo}</div>
              </div>
            ))}
            <div className="mt-5 whitespace-pre-wrap">{preview.rodape}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
