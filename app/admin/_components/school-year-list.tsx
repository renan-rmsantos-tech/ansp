"use client";

import { useState, useCallback } from "react";
import {
  toggleSchoolYear,
  deleteSchoolYear,
} from "../_actions/admin-actions";
import { Modal } from "./modal";

export interface SchoolYear {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
}

interface SchoolYearListProps {
  years: SchoolYear[];
  onYearsChange: (years: SchoolYear[]) => void;
}

export function SchoolYearList({ years, onYearsChange }: SchoolYearListProps) {
  const [confirmAction, setConfirmAction] = useState<{
    type: "toggle" | "delete";
    id: string;
    nome: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(
    async (id: string, nome: string, currentlyActive: boolean) => {
      if (currentlyActive) {
        setConfirmAction({ type: "toggle", id, nome });
        return;
      }
      setLoading(true);
      const result = await toggleSchoolYear(id);
      if (result.success) {
        onYearsChange(
          years.map((y) => ({ ...y, ativo: y.id === id ? true : false }))
        );
      }
      setLoading(false);
    },
    [years, onYearsChange]
  );

  const handleDelete = useCallback((id: string, nome: string) => {
    setConfirmAction({ type: "delete", id, nome });
  }, []);

  const confirmAndExecute = useCallback(async () => {
    if (!confirmAction) return;
    setLoading(true);

    if (confirmAction.type === "toggle") {
      const result = await toggleSchoolYear(confirmAction.id);
      if (result.success) {
        onYearsChange(
          years.map((y) => ({
            ...y,
            ativo: y.id === confirmAction.id ? false : y.ativo,
          }))
        );
      }
    } else {
      const result = await deleteSchoolYear(confirmAction.id);
      if (result.success) {
        onYearsChange(years.filter((y) => y.id !== confirmAction.id));
      }
    }

    setConfirmAction(null);
    setLoading(false);
  }, [confirmAction, years, onYearsChange]);

  const confirmTitle =
    confirmAction?.type === "toggle"
      ? "Desativar ano letivo?"
      : "Excluir ano letivo?";

  return (
    <div data-testid="school-year-list">
      {years.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Nenhum ano letivo cadastrado. Use o formulário acima para criar o primeiro.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Início</th>
                <th className="px-4 py-3">Fim</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {years.map((year) => (
                <tr
                  key={year.id}
                  className="border-b border-border last:border-0"
                  data-testid={`school-year-row-${year.id}`}
                >
                  <td className="px-4 py-3 font-medium text-fg">{year.nome}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(year.data_inicio + "T12:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(year.data_fim + "T12:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        year.ativo
                          ? "bg-success/15 text-success"
                          : "bg-muted/15 text-muted"
                      }`}
                      data-testid="status-badge"
                    >
                      {year.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(year.id, year.nome, year.ativo)
                        }
                        disabled={loading}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                          year.ativo
                            ? "border border-border text-muted hover:bg-bg"
                            : "bg-accent text-white hover:bg-accent/90"
                        }`}
                        data-testid="toggle-button"
                      >
                        {year.ativo ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(year.id, year.nome)}
                        disabled={loading}
                        className="rounded-md border border-danger/30 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
                        data-testid="delete-button"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmAction && (
        <Modal
          open
          onClose={() => setConfirmAction(null)}
          title={confirmTitle}
          testId="confirm-dialog"
        >
          <div className="px-4 py-4">
            <p className="text-sm text-muted">
              {confirmAction.type === "toggle"
                ? `Tem certeza que deseja desativar "${confirmAction.nome}"? O período de inscrições será encerrado.`
                : `Tem certeza que deseja excluir "${confirmAction.nome}"? Esta ação não pode ser desfeita.`}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-bg"
                data-testid="confirm-cancel"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmAndExecute}
                disabled={loading}
                className={`rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${
                  confirmAction.type === "delete"
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-accent hover:bg-accent/90"
                }`}
                data-testid="confirm-ok"
              >
                {loading ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
