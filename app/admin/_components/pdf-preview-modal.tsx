"use client";

import { useEffect, useMemo, useRef } from "react";

interface PdfPreviewModalProps {
  pdfBase64: string;
  filename: string;
  title?: string;
  onClose: () => void;
}

// Visualização de PDF em overlay, com opções de imprimir e baixar.
export function PdfPreviewModal({
  pdfBase64,
  filename,
  title = "Visualizar PDF",
  onClose,
}: PdfPreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const url = useMemo(() => {
    const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }, [pdfBase64]);

  // Libera o blob ao desmontar e fecha com Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      URL.revokeObjectURL(url);
    };
  }, [url, onClose]);

  const handlePrint = () => {
    const frame = iframeRef.current;
    if (frame?.contentWindow) {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/60 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid="pdf-preview-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-surface shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="truncate text-sm font-semibold text-fg">{title}</h2>
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-md border border-accent px-3 py-1.5 text-sm font-medium text-accent hover:bg-bg"
              data-testid="pdf-print-button"
            >
              Imprimir
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-md border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
              data-testid="pdf-download-button"
            >
              Baixar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-bg"
              data-testid="pdf-close-button"
              aria-label="Fechar"
            >
              Fechar
            </button>
          </div>
        </div>
        <iframe
          ref={iframeRef}
          src={url}
          title={title}
          className="min-h-0 flex-1 bg-white"
          data-testid="pdf-preview-frame"
        />
      </div>
    </div>
  );
}
