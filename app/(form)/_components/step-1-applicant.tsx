"use client";

import type { FormData, OtherChild } from "./form-types";
import { FileUpload } from "./file-upload";
import type { UploadedFile } from "./file-upload";

interface Step1Props {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
}

export function Step1Applicant({ data, onChange, errors }: Step1Props) {
  const updateField = (field: keyof FormData, value: string) => {
    onChange({ [field]: value });
  };

  const updateFiles = (field: keyof FormData, files: UploadedFile[]) => {
    onChange({ [field]: files });
  };

  const addChild = () => {
    onChange({
      outros_filhos: [
        ...data.outros_filhos,
        { nome: "", cpf: "", nascimento: "" },
      ],
    });
  };

  const removeChild = (index: number) => {
    onChange({
      outros_filhos: data.outros_filhos.filter((_, i) => i !== index),
    });
  };

  const updateChild = (
    index: number,
    field: keyof OtherChild,
    value: string
  ) => {
    const updated = [...data.outros_filhos];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ outros_filhos: updated });
  };

  return (
    <div data-testid="step-1">
      <div className="rounded-lg border border-border bg-surface p-8 max-sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Dados dos Solicitantes
        </h2>
        <p className="mb-6 text-sm text-muted">
          Informações pessoais dos pais ou responsáveis.
        </p>

        <div className="mb-5">
          <label className="mb-1.5 block text-[13px] font-medium tracking-wide text-fg">
            Escola <span className="text-danger">*</span>
          </label>
          <select
            value={data.escola}
            onChange={(e) => updateField("escola", e.target.value)}
            className={`w-full rounded-md border bg-bg px-3.5 py-2.5 text-[15px] text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.escola ? "border-danger" : "border-border"}`}
            data-testid="escola-select"
          >
            <option value="" disabled>
              Selecione a escola
            </option>
            <option value="colegio_sao_jose">Colégio São José</option>
            <option value="escola_santa_catarina">
              Escola Santa Catarina
            </option>
            <option value="escola_nossa_senhora">
              Escola Nossa Senhora da Providência
            </option>
          </select>
          {errors.escola && (
            <p className="mt-1 text-xs text-danger">{errors.escola}</p>
          )}
        </div>

        <div className="my-6 h-px bg-border" />

        <Field
          label="Nome e sobrenome do pai"
          required
          value={data.pai_nome}
          onChange={(v) => updateField("pai_nome", v)}
          error={errors.pai_nome}
          testId="pai-nome"
        />
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <Field
            label="RG do pai"
            required
            value={data.pai_rg}
            onChange={(v) => updateField("pai_rg", v)}
            error={errors.pai_rg}
            testId="pai-rg"
          />
          <Field
            label="CPF do pai"
            required
            value={data.pai_cpf}
            onChange={(v) => updateField("pai_cpf", v)}
            error={errors.pai_cpf}
            placeholder="000.000.000-00"
            testId="pai-cpf"
          />
        </div>
        <Field
          label="Profissão do pai"
          value={data.pai_profissao}
          onChange={(v) => updateField("pai_profissao", v)}
        />
        <div className="mb-5">
          <label className="mb-1.5 block text-[13px] font-medium tracking-wide text-fg">
            Documento do pai (RG ou CPF){" "}
            <span className="text-danger">*</span>
          </label>
          <FileUpload
            label="para enviar foto do RG ou CPF do pai"
            category="rg_pai"
            files={data.doc_pai}
            onChange={(f) => updateFiles("doc_pai", f)}
            required
            error={errors.doc_pai}
          />
        </div>

        <div className="my-6 h-px bg-border" />

        <Field
          label="Nome e sobrenome da mãe"
          required
          value={data.mae_nome}
          onChange={(v) => updateField("mae_nome", v)}
          error={errors.mae_nome}
          testId="mae-nome"
        />
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <Field
            label="CPF da mãe"
            required
            value={data.mae_cpf}
            onChange={(v) => updateField("mae_cpf", v)}
            error={errors.mae_cpf}
            placeholder="000.000.000-00"
            testId="mae-cpf"
          />
          <Field
            label="Profissão da mãe"
            value={data.mae_profissao}
            onChange={(v) => updateField("mae_profissao", v)}
          />
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-[13px] font-medium tracking-wide text-fg">
            Documento da mãe (RG ou CPF){" "}
            <span className="text-danger">*</span>
          </label>
          <FileUpload
            label="para enviar foto do RG ou CPF da mãe"
            category="rg_mae"
            files={data.doc_mae}
            onChange={(f) => updateFiles("doc_mae", f)}
            required
            error={errors.doc_mae}
          />
        </div>

        <div className="my-6 h-px bg-border" />

        <div className="mb-5">
          <label className="mb-1.5 block text-[13px] font-medium tracking-wide text-fg">
            Certidão de Casamento
          </label>
          <FileUpload
            label="para enviar a Certidão de Casamento"
            category="certidao"
            files={data.certidao_casamento}
            onChange={(f) => updateFiles("certidao_casamento", f)}
          />
        </div>

        <div className="my-6 h-px bg-border" />

        <Field
          label="Endereço completo"
          required
          value={data.endereco}
          onChange={(v) => updateField("endereco", v)}
          error={errors.endereco}
          testId="endereco"
        />
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <Field
            label="CEP"
            value={data.cep}
            onChange={(v) => updateField("cep", v)}
            placeholder="00000-000"
          />
          <Field
            label="Telefone"
            required
            value={data.telefone}
            onChange={(v) => updateField("telefone", v)}
            error={errors.telefone}
            placeholder="(00) 00000-0000"
            testId="telefone"
          />
        </div>
        <Field
          label="E-mail"
          type="email"
          value={data.email}
          onChange={(v) => updateField("email", v)}
          placeholder="exemplo@email.com"
        />

        <div className="mb-5">
          <label className="mb-1.5 block text-[13px] font-medium tracking-wide text-fg">
            Comprovante de Endereço <span className="text-danger">*</span>
          </label>
          <FileUpload
            label="para enviar comprovante de endereço"
            category="comprovante_endereco"
            files={data.comprovante_endereco}
            onChange={(f) => updateFiles("comprovante_endereco", f)}
            required
            error={errors.comprovante_endereco}
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface p-8 max-sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Outros Filhos
        </h2>
        <p className="mb-6 text-sm text-muted">
          Informe nome e data de nascimento dos demais filhos que não estão na
          escola.
        </p>

        <div data-testid="filhos-list">
          {data.outros_filhos.map((child, i) => (
            <div
              key={i}
              className="mb-2.5 grid grid-cols-[1fr_160px_140px_32px] items-start gap-2.5 max-sm:grid-cols-1"
            >
              <input
                type="text"
                placeholder="Nome completo"
                value={child.nome}
                onChange={(e) => updateChild(i, "nome", e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-[15px] text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <input
                type="text"
                placeholder="000.000.000-00"
                value={child.cpf}
                onChange={(e) => updateChild(i, "cpf", e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-[15px] text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <input
                type="date"
                value={child.nascimento}
                onChange={(e) => updateChild(i, "nascimento", e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-[15px] text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="button"
                onClick={() => removeChild(i)}
                className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-lg text-muted transition-colors hover:border-danger hover:text-danger"
                title="Remover"
                data-testid="remove-child"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addChild}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gold/10 px-4 py-2 text-[13px] font-medium tracking-wide text-gold transition-colors hover:bg-gold/20"
          data-testid="add-child"
        >
          + Adicionar filho
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  testId,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  testId?: string;
}) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-[13px] font-medium tracking-wide text-fg">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border bg-bg px-3.5 py-2.5 text-[15px] text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? "border-danger" : "border-border"}`}
        data-testid={testId}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
