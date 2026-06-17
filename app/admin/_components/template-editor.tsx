"use client";

import { useState, useCallback } from "react";
import { saveTemplate } from "../_actions/admin-actions";
import { TemplatePreview } from "./template-preview";

const AVAILABLE_TOKENS = [
  { token: "{nome_pai}", desc: "Nome do pai/responsável" },
  { token: "{nome_mae}", desc: "Nome da mãe" },
  { token: "{escola}", desc: "Nome da escola" },
  { token: "{aluno}", desc: "Nome(s) do(s) aluno(s)" },
  { token: "{desconto}", desc: "Desconto concedido (%)" },
  { token: "{data}", desc: "Data da decisão" },
  { token: "{motivo}", desc: "Motivo da decisão" },
  { token: "{ano_letivo}", desc: "Ano letivo" },
];

export interface TemplateData {
  id: string;
  tipo: "aprovacao" | "rejeicao";
  cabecalho: string;
  corpo: string;
  rodape: string;
}

interface TemplateEditorProps {
  initialTemplates: TemplateData[];
}

type TabType = "aprovacao" | "rejeicao";

const TAB_LABELS: Record<TabType, string> = {
  aprovacao: "Aprovação",
  rejeicao: "Rejeição",
};

export function TemplateEditor({ initialTemplates }: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("aprovacao");
  const [templates, setTemplates] = useState<Record<TabType, { cabecalho: string; corpo: string; rodape: string }>>(() => {
    const map: Record<TabType, { cabecalho: string; corpo: string; rodape: string }> = {
      aprovacao: { cabecalho: "", corpo: "", rodape: "" },
      rejeicao: { cabecalho: "", corpo: "", rodape: "" },
    };
    for (const t of initialTemplates) {
      if (t.tipo === "aprovacao" || t.tipo === "rejeicao") {
        map[t.tipo] = {
          cabecalho: t.cabecalho,
          corpo: t.corpo,
          rodape: t.rodape,
        };
      }
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const current = templates[activeTab];

  const updateField = useCallback(
    (field: "cabecalho" | "corpo" | "rodape", value: string) => {
      setTemplates((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], [field]: value },
      }));
      setMessage(null);
    },
    [activeTab]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    const result = await saveTemplate({
      tipo: activeTab,
      cabecalho: current.cabecalho,
      corpo: current.corpo,
      rodape: current.rodape,
    });
    if (result.success) {
      setMessage({ type: "success", text: "Modelo salvo com sucesso." });
    } else {
      setMessage({ type: "error", text: result.error ?? "Erro ao salvar modelo." });
    }
    setSaving(false);
  }, [activeTab, current]);

  return (
    <div data-testid="template-editor">
      {/* Token reference */}
      <div
        className="mb-4 rounded-lg border border-border bg-cream p-4"
        data-testid="token-reference"
      >
        <h3 className="mb-2 text-sm font-medium text-muted">
          Tokens disponíveis
        </h3>
        <p className="mb-3 text-xs text-muted">
          Copie e cole no texto. Cada token será substituído pelos dados da solicitação.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {AVAILABLE_TOKENS.map((t) => (
            <li
              key={t.token}
              className="flex items-start gap-2 rounded-md bg-bg px-2 py-1.5 text-xs"
              data-testid="token-item"
            >
              <code className="shrink-0 font-mono text-fg">{t.token}</code>
              <span className="text-muted">{t.desc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Tipo de modelo"
        className="flex gap-1 border-b border-border"
        data-testid="template-tabs"
      >
        {(["aprovacao", "rejeicao"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setMessage(null);
            }}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-fg"
            }`}
            data-testid={`tab-${tab}`}
            aria-selected={activeTab === tab}
            role="tab"
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Editor + Preview grid */}
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="tpl-cabecalho"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Cabeçalho
            </label>
            <textarea
              id="tpl-cabecalho"
              value={current.cabecalho}
              onChange={(e) => updateField("cabecalho", e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              data-testid="field-cabecalho"
            />
          </div>
          <div>
            <label
              htmlFor="tpl-corpo"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Corpo
            </label>
            <textarea
              id="tpl-corpo"
              value={current.corpo}
              onChange={(e) => updateField("corpo", e.target.value)}
              rows={8}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              data-testid="field-corpo"
            />
          </div>
          <div>
            <label
              htmlFor="tpl-rodape"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Rodapé
            </label>
            <textarea
              id="tpl-rodape"
              value={current.rodape}
              onChange={(e) => updateField("rodape", e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              data-testid="field-rodape"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-success" : "text-danger"
              }`}
              data-testid="save-message"
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
              data-testid="save-button"
            >
              {saving ? "Salvando..." : "Salvar Modelo"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <TemplatePreview
          cabecalho={current.cabecalho}
          corpo={current.corpo}
          rodape={current.rodape}
        />
      </div>
    </div>
  );
}
