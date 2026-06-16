"use client";

import { useState, useCallback } from "react";
import { ApplicationDetail } from "./application-detail";
import { DecisionActions } from "./decision-actions";
import { getApplicationDetail, exportDecision } from "../_actions/admin-actions";

export interface ApplicationSummary {
  id: string;
  status: string;
  escola: string;
  pai_nome: string;
  mae_nome: string;
  data_envio: string;
  desconto_solicitado: number;
  desconto_concedido?: number | null;
  motivo?: string | null;
  data_decisao?: string | null;
  students: Array<{ id: string; nome: string; serie: string; mensalidade: number }>;
}

interface ApplicationCardProps {
  application: ApplicationSummary;
  onDecision: (id: string, status: string, desconto_concedido?: number | null) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-warn/15 text-warn",
  aprovada: "bg-success/15 text-success",
  rejeitada: "bg-danger/15 text-danger",
};

export function ApplicationCard({ application, onDecision }: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toggleExpand = useCallback(async () => {
    if (!expanded && !detail) {
      setLoadingDetail(true);
      const result = await getApplicationDetail(application.id);
      if (result.data) {
        setDetail(result.data as Record<string, unknown>);
      }
      setLoadingDetail(false);
    }
    setExpanded((prev) => !prev);
  }, [expanded, detail, application.id]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    const result = await exportDecision(application.id);
    if ("content" in result) {
      const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }, [application.id]);

  const decided = application.status !== "pendente";

  return (
    <div
      className="rounded-lg border border-border bg-surface"
      data-testid={`application-card-${application.id}`}
    >
      <button
        type="button"
        onClick={toggleExpand}
        className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-bg/50"
        aria-expanded={expanded}
        data-testid="card-toggle"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base font-semibold text-fg">
              {application.pai_nome} &amp; {application.mae_nome}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[application.status] ?? ""}`}
              data-testid="status-badge"
            >
              {STATUS_LABELS[application.status] ?? application.status}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span>{application.escola}</span>
            <span>
              {new Date(application.data_envio).toLocaleDateString("pt-BR")}
            </span>
            <span data-testid="student-count">
              {application.students.length}{" "}
              {application.students.length === 1 ? "aluno" : "alunos"}
            </span>
            <span>Desconto: {application.desconto_solicitado}%</span>
          </div>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`mt-1 size-5 shrink-0 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3" data-testid="card-detail">
          {loadingDetail ? (
            <p className="py-4 text-center text-sm text-muted">Carregando...</p>
          ) : detail ? (
            <>
              <ApplicationDetail detail={detail} />
              {decided ? (
                <div className="mt-4 rounded-lg border border-border bg-cream p-4" data-testid="decision-info">
                  <h4 className="font-heading text-sm font-semibold text-fg">
                    Decisão
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-muted">
                    <p>
                      Status:{" "}
                      <span className={application.status === "aprovada" ? "text-success" : "text-danger"}>
                        {STATUS_LABELS[application.status]}
                      </span>
                    </p>
                    {application.desconto_concedido != null && (
                      <p>Desconto concedido: {application.desconto_concedido}%</p>
                    )}
                    {application.motivo && <p>Motivo: {application.motivo}</p>}
                    {application.data_decisao && (
                      <p>
                        Data:{" "}
                        {new Date(application.data_decisao).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="mt-3 rounded-md border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
                    data-testid="export-button"
                  >
                    {exporting ? "Exportando..." : "Exportar Decisão"}
                  </button>
                </div>
              ) : (
                <DecisionActions
                  applicationId={application.id}
                  requestedDiscount={application.desconto_solicitado}
                  onDecision={onDecision}
                />
              )}
            </>
          ) : (
            <p className="py-4 text-center text-sm text-danger">
              Erro ao carregar detalhes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
