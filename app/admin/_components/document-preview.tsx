"use client";

import { useState, useCallback } from "react";
import { getDocumentUrl } from "../_actions/admin-actions";

interface Document {
  id: string;
  categoria: string;
  nome_arquivo: string;
  storage_path: string;
  mime_type: string;
}

interface DocumentPreviewProps {
  documents: Array<Record<string, unknown>>;
}

const CATEGORY_LABELS: Record<string, string> = {
  rg_pai: "RG do Pai",
  rg_mae: "RG da Mãe",
  certidao: "Certidão de Casamento",
  comprovante_endereco: "Comprovante de Endereço",
  extrato_ir: "Extrato IR",
  extrato_bancario: "Extrato Bancário",
  rg_aluno: "RG do Aluno",
  certidao_nascimento: "Certidão de Nascimento",
};

export function DocumentPreview({ documents }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  const docs = documents as unknown as Document[];

  const handlePreview = useCallback(async (doc: Document) => {
    setLoading(doc.id);
    const result = await getDocumentUrl(doc.storage_path);
    if ("url" in result) {
      setPreviewUrl(result.url);
      setPreviewName(doc.nome_arquivo);
    }
    setLoading(null);
  }, []);

  const handleDownload = useCallback(async (doc: Document) => {
    setLoading(doc.id);
    const result = await getDocumentUrl(doc.storage_path);
    if ("url" in result) {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = doc.nome_arquivo;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    }
    setLoading(null);
  }, []);

  return (
    <div data-testid="documents-section">
      <ul className="space-y-2">
        {docs.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <span className="text-muted">
              {CATEGORY_LABELS[doc.categoria] ?? doc.categoria}:
            </span>
            <span className="text-fg">{doc.nome_arquivo}</span>
            <div className="flex gap-1">
              {doc.mime_type === "application/pdf" && (
                <button
                  type="button"
                  onClick={() => handlePreview(doc)}
                  disabled={loading === doc.id}
                  className="rounded border border-border px-2 py-0.5 text-xs text-accent hover:bg-bg disabled:opacity-50"
                  data-testid={`preview-${doc.id}`}
                >
                  {loading === doc.id ? "..." : "Visualizar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDownload(doc)}
                disabled={loading === doc.id}
                className="rounded border border-border px-2 py-0.5 text-xs text-accent hover:bg-bg disabled:opacity-50"
                data-testid={`download-${doc.id}`}
              >
                Baixar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {previewUrl && (
        <div className="mt-3" data-testid="pdf-preview">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-fg">{previewName}</span>
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="text-sm text-muted hover:text-fg"
            >
              Fechar
            </button>
          </div>
          <iframe
            src={previewUrl}
            title={previewName}
            className="h-[500px] w-full rounded border border-border"
          />
        </div>
      )}
    </div>
  );
}
