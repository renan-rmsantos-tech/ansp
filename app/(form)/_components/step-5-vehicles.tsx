"use client";

import type { FormData, Vehicle, Benefactor, Collaboration } from "./form-types";

interface Step5Props {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
}

export function Step5Vehicles({ data, onChange, errors }: Step5Props) {
  const addVehicle = () => {
    onChange({
      veiculos: [...data.veiculos, { marca: "", modelo: "", ano: "" }],
    });
  };

  const removeVehicle = (index: number) => {
    onChange({ veiculos: data.veiculos.filter((_, i) => i !== index) });
  };

  const updateVehicle = (
    index: number,
    field: keyof Vehicle,
    value: string
  ) => {
    const updated = [...data.veiculos];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ veiculos: updated });
  };

  const updateCollab = (field: keyof Collaboration, value: boolean | string) => {
    onChange({
      colaboracao: { ...data.colaboracao, [field]: value },
    });
  };

  const updateBenefactor = (
    index: number,
    field: keyof Benefactor,
    value: string
  ) => {
    const updated = [...data.indicacao_benfeitores];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ indicacao_benfeitores: updated });
  };

  return (
    <div data-testid="step-5" className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-8 max-sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Veículos da Família
        </h2>
        <p className="mb-6 text-sm text-muted">
          Informe os veículos de propriedade da família, se houver.
        </p>

        <div data-testid="veiculos-list">
          {data.veiculos.map((v, i) => (
            <div
              key={i}
              className="mb-3 grid grid-cols-[1fr_1fr_100px_40px] items-end gap-2.5 max-sm:grid-cols-2"
            >
              <input
                type="text"
                placeholder="Marca"
                value={v.marca}
                onChange={(e) => updateVehicle(i, "marca", e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <input
                type="text"
                placeholder="Modelo"
                value={v.modelo}
                onChange={(e) => updateVehicle(i, "modelo", e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <input
                type="text"
                placeholder="Ano"
                value={v.ano}
                onChange={(e) => updateVehicle(i, "ano", e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="button"
                onClick={() => removeVehicle(i)}
                className="grid h-[42px] w-10 place-items-center rounded-md border border-border bg-surface text-lg text-muted transition-colors hover:border-danger hover:text-danger max-sm:col-span-2 max-sm:h-auto max-sm:w-full max-sm:py-2 max-sm:text-[13px]"
                title="Remover"
                data-testid="remove-vehicle"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVehicle}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gold/10 px-4 py-2 text-[13px] font-medium tracking-wide text-gold transition-colors hover:bg-gold/20"
          data-testid="add-vehicle"
        >
          + Adicionar veículo
        </button>
      </div>

      <div className="rounded-lg border border-border bg-surface p-8 max-sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Colaboração Voluntária
        </h2>
        <p className="mb-6 text-sm text-muted">
          Indique como sua família pode colaborar com a escola.
        </p>

        <div className="flex flex-col gap-3" data-testid="colaboracao">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={data.colaboracao.limpeza}
              onChange={(e) => updateCollab("limpeza", e.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-accent"
              id="collab-limpeza"
            />
            <label htmlFor="collab-limpeza" className="cursor-pointer text-sm text-fg">
              Limpeza
            </label>
          </div>
          {data.colaboracao.limpeza && (
            <div className="ml-7">
              <input
                type="number"
                min="1"
                placeholder="Vezes por semana"
                value={data.colaboracao.limpeza_vezes_semana}
                onChange={(e) =>
                  updateCollab("limpeza_vezes_semana", e.target.value)
                }
                className="w-[200px] rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 max-sm:w-full"
              />
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={data.colaboracao.mutirao}
              onChange={(e) => updateCollab("mutirao", e.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-accent"
              id="collab-mutirao"
            />
            <label htmlFor="collab-mutirao" className="cursor-pointer text-sm text-fg">
              Mutirão
            </label>
          </div>
          {data.colaboracao.mutirao && (
            <div className="ml-7">
              <input
                type="number"
                min="1"
                placeholder="Sábados por mês"
                value={data.colaboracao.mutirao_sabados}
                onChange={(e) =>
                  updateCollab("mutirao_sabados", e.target.value)
                }
                className="w-[200px] rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 max-sm:w-full"
              />
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={data.colaboracao.arrecadacao}
              onChange={(e) => updateCollab("arrecadacao", e.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-accent"
              id="collab-arrecadacao"
            />
            <label htmlFor="collab-arrecadacao" className="cursor-pointer text-sm text-fg">
              Arrecadação
            </label>
          </div>

          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={data.colaboracao.benfeitores}
              onChange={(e) => updateCollab("benfeitores", e.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-accent"
              id="collab-benfeitores"
            />
            <label htmlFor="collab-benfeitores" className="cursor-pointer text-sm text-fg">
              Buscar benfeitores
            </label>
          </div>

          <div className="flex items-start gap-2.5">
            <label htmlFor="collab-outros" className="mt-2 text-sm text-fg">
              Outros:
            </label>
            <input
              type="text"
              id="collab-outros"
              value={data.colaboracao.outros}
              onChange={(e) => updateCollab("outros", e.target.value)}
              className="flex-1 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-8 max-sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Indicação de Benfeitores
        </h2>
        <p className="mb-6 text-sm text-muted">
          Indique 10 pessoas que possam ser contatadas como possíveis benfeitores
          da escola.
        </p>

        <div className="mb-2 grid grid-cols-[28px_1fr_1fr] gap-2.5 text-[11px] font-medium uppercase tracking-widest text-muted max-sm:grid-cols-[28px_1fr]">
          <span>#</span>
          <span>Nome completo</span>
          <span className="max-sm:hidden">E-mail</span>
        </div>

        <div data-testid="benfeitores-list">
          {data.indicacao_benfeitores.map((b, i) => (
            <div
              key={i}
              className="mb-2 grid grid-cols-[28px_1fr_1fr] items-center gap-2.5 max-sm:grid-cols-[28px_1fr]"
            >
              <span className="text-center text-[13px] font-medium text-muted">
                {i + 1}
              </span>
              <input
                type="text"
                placeholder="Nome"
                value={b.nome}
                onChange={(e) => updateBenefactor(i, "nome", e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={b.email}
                onChange={(e) =>
                  updateBenefactor(i, "email", e.target.value)
                }
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 max-sm:col-start-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
