"use client";

import { DocumentPreview } from "./document-preview";

interface ApplicationDetailProps {
  detail: Record<string, unknown>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h4 className="mb-2 border-b border-border pb-1 font-heading text-sm font-semibold text-fg">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="text-sm">
      <span className="text-muted">{label}: </span>
      <span className="text-fg">{value ?? "—"}</span>
    </div>
  );
}

function formatCurrency(value?: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ApplicationDetail({ detail }: ApplicationDetailProps) {
  const d = detail as Record<string, unknown>;
  const students = (d.students as Array<Record<string, unknown>>) ?? [];
  const otherChildren = (d.other_children as Array<Record<string, unknown>>) ?? [];
  const vehicles = (d.vehicles as Array<Record<string, unknown>>) ?? [];
  const collaboration = d.collaboration as Record<string, unknown> | null;
  const benefactors = (d.benefactors as Array<Record<string, unknown>>) ?? [];
  const documents = (d.documents as Array<Record<string, unknown>>) ?? [];

  return (
    <div data-testid="application-detail">
      <Section title="Dados do Solicitante">
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          <Field label="Pai" value={d.pai_nome as string} />
          <Field label="RG" value={d.pai_rg as string} />
          <Field label="CPF" value={d.pai_cpf as string} />
          <Field label="Profissão" value={d.pai_profissao as string} />
          <Field label="Mãe" value={d.mae_nome as string} />
          <Field label="CPF Mãe" value={d.mae_cpf as string} />
          <Field label="Profissão Mãe" value={d.mae_profissao as string} />
          <Field label="Escola" value={d.escola as string} />
          <Field label="Endereço" value={d.endereco as string} />
          <Field label="CEP" value={d.cep as string} />
          <Field label="Telefone" value={d.telefone as string} />
          <Field label="E-mail" value={d.email as string} />
        </div>
      </Section>

      <Section title="Alunos">
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="students-table">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="pb-1 pr-3">Nome</th>
                  <th className="pb-1 pr-3">CPF</th>
                  <th className="pb-1 pr-3">Série</th>
                  <th className="pb-1">Mensalidade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id as string} className="border-b border-border/50">
                    <td className="py-1 pr-3">{s.nome as string}</td>
                    <td className="py-1 pr-3">{(s.cpf as string) || "—"}</td>
                    <td className="py-1 pr-3">{s.serie as string}</td>
                    <td className="py-1">{formatCurrency(s.mensalidade as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">Nenhum aluno registrado.</p>
        )}
      </Section>

      {otherChildren.length > 0 && (
        <Section title="Outros Filhos">
          <ul className="space-y-1 text-sm">
            {otherChildren.map((c) => (
              <li key={c.id as string}>
                {c.nome as string} — {c.nascimento as string}
                {c.cpf ? ` (CPF: ${c.cpf})` : ""}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Renda e Despesas">
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          <Field label="Renda do Pai" value={formatCurrency(d.renda_pai as number)} />
          <Field label="Renda da Mãe" value={formatCurrency(d.renda_mae as number)} />
          <Field label="Outras Rendas" value={formatCurrency(d.renda_outros as number)} />
          <Field label="Pessoas no Domicílio" value={d.pessoas_domicilio as number} />
        </div>
        <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2" data-testid="expenses-section">
          <Field label="Aluguel" value={formatCurrency(d.despesa_aluguel as number)} />
          <Field label="Serviços" value={formatCurrency(d.despesa_servicos as number)} />
          <Field label="TV" value={formatCurrency(d.despesa_tv as number)} />
          <Field label="Celular (plano)" value={formatCurrency(d.despesa_celular_plano as number)} />
          <Field label="Celular (parcelas)" value={formatCurrency(d.despesa_celular_parcelas as number)} />
          <Field label="Internet" value={formatCurrency(d.despesa_internet as number)} />
        </div>
      </Section>

      {vehicles.length > 0 && (
        <Section title="Veículos">
          <ul className="space-y-1 text-sm" data-testid="vehicles-section">
            {vehicles.map((v) => (
              <li key={v.id as string}>
                {v.marca as string} {v.modelo as string} ({v.ano as string})
              </li>
            ))}
          </ul>
        </Section>
      )}

      {collaboration && (
        <Section title="Colaboração Voluntária">
          <div className="space-y-1 text-sm" data-testid="volunteer-section">
            {collaboration.limpeza && (
              <p>Limpeza: {collaboration.limpeza_vezes_semana}x por semana</p>
            )}
            {collaboration.mutirao && (
              <p>Mutirão: {collaboration.mutirao_sabados} sábados</p>
            )}
            {collaboration.arrecadacao && <p>Arrecadação: Sim</p>}
            {collaboration.buscar_benfeitores && <p>Buscar benfeitores: Sim</p>}
            {collaboration.outros && (
              <p>Outros: {collaboration.outros as string}</p>
            )}
          </div>
        </Section>
      )}

      {benefactors.length > 0 && (
        <Section title="Indicação de Benfeitores">
          <ul className="space-y-1 text-sm" data-testid="benefactors-section">
            {benefactors.map((b) => (
              <li key={b.id as string}>
                {b.nome as string}
                {b.email ? ` (${b.email})` : ""}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {documents.length > 0 && (
        <Section title="Documentos">
          <DocumentPreview documents={documents} />
        </Section>
      )}
    </div>
  );
}
