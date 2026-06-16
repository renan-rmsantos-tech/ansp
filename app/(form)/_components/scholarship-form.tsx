"use client";

import { useCallback, useState } from "react";
import { ProgressBar } from "./progress-bar";
import { Step1Applicant } from "./step-1-applicant";
import { Step2Students } from "./step-2-students";
import { Step3Income } from "./step-3-income";
import { Step4Expenses } from "./step-4-expenses";
import { Step5Vehicles } from "./step-5-vehicles";
import { Step6Review } from "./step-6-review";
import { SuccessScreen } from "./success-screen";
import { submitApplication } from "../_actions/form-actions";
import { INITIAL_FORM_DATA, parseMoney } from "./form-types";
import type { FormData } from "./form-types";
import type { ApplicationSubmission } from "@/lib/validations/application-schema";

const TOTAL_STEPS = 6;

function validateStep1(data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.escola) errors.escola = "Selecione a escola";
  if (!data.pai_nome.trim()) errors.pai_nome = "Campo obrigatório";
  if (!data.pai_rg.trim()) errors.pai_rg = "Campo obrigatório";
  if (!data.pai_cpf.trim()) errors.pai_cpf = "Campo obrigatório";
  if (!data.mae_nome.trim()) errors.mae_nome = "Campo obrigatório";
  if (!data.mae_cpf.trim()) errors.mae_cpf = "Campo obrigatório";
  if (!data.endereco.trim()) errors.endereco = "Campo obrigatório";
  if (!data.telefone.trim()) errors.telefone = "Campo obrigatório";
  return errors;
}

function validateStep2(data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.alunos.length === 0) {
    errors.alunos = "Adicione pelo menos um aluno";
  }
  for (let i = 0; i < data.alunos.length; i++) {
    const a = data.alunos[i];
    if (!a.nome.trim()) errors[`aluno_${i}_nome`] = "Nome obrigatório";
  }
  return errors;
}

function validateStep3(data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.pessoas_domicilio || Number(data.pessoas_domicilio) < 1) {
    errors.pessoas_domicilio = "Campo obrigatório";
  }
  return errors;
}

export function ScholarshipForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    ...INITIAL_FORM_DATA,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const updateFormData = useCallback((partial: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    let stepErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        stepErrors = validateStep1(formData);
        break;
      case 2:
        stepErrors = validateStep2(formData);
        break;
      case 3:
        stepErrors = validateStep3(formData);
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, formData]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!accepted) {
      setAcceptError(true);
      setTimeout(() => setAcceptError(false), 2000);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const payload: ApplicationSubmission = {
      escola: formData.escola,
      pai: {
        nome: formData.pai_nome,
        rg: formData.pai_rg,
        cpf: formData.pai_cpf,
        profissao: formData.pai_profissao || undefined,
        documentos: formData.doc_pai.filter((f) => f.path).map((f) => f.path),
      },
      mae: {
        nome: formData.mae_nome,
        cpf: formData.mae_cpf,
        profissao: formData.mae_profissao || undefined,
        documentos: formData.doc_mae.filter((f) => f.path).map((f) => f.path),
      },
      certidao_casamento: formData.certidao_casamento
        .filter((f) => f.path)
        .map((f) => f.path),
      endereco: formData.endereco,
      cep: formData.cep || undefined,
      telefone: formData.telefone,
      email: formData.email || undefined,
      comprovante_endereco: formData.comprovante_endereco
        .filter((f) => f.path)
        .map((f) => f.path),
      outros_filhos: formData.outros_filhos
        .filter((c) => c.nome.trim())
        .map((c) => ({
          nome: c.nome,
          cpf: c.cpf || undefined,
          nascimento: c.nascimento,
        })),
      alunos: formData.alunos.map((a) => ({
        nome: a.nome,
        cpf: a.cpf || undefined,
        serie: a.serie,
        mensalidade: parseMoney(a.mensalidade),
        documentos: [
          ...a.docRg.filter((f) => f.path).map((f) => f.path),
          ...a.docCertidao.filter((f) => f.path).map((f) => f.path),
        ],
      })),
      desconto_solicitado: parseMoney(formData.desconto_solicitado),
      renda: {
        pai: parseMoney(formData.renda_pai) || undefined,
        mae: parseMoney(formData.renda_mae) || undefined,
        outros: parseMoney(formData.renda_outros) || undefined,
        pessoas: Number(formData.pessoas_domicilio) || 1,
      },
      extrato_ir: formData.extrato_ir
        .filter((f) => f.path)
        .map((f) => f.path),
      despesas: {
        aluguel: parseMoney(formData.despesa_aluguel) || undefined,
        servicos: parseMoney(formData.despesa_servicos) || undefined,
        tv: parseMoney(formData.despesa_tv) || undefined,
        celular_plano: parseMoney(formData.despesa_celular_plano) || undefined,
        celular_parcelas:
          parseMoney(formData.despesa_celular_parcelas) || undefined,
        internet: parseMoney(formData.despesa_internet) || undefined,
      },
      extratos_bancarios: formData.extratos_bancarios
        .filter((f) => f.path)
        .map((f) => f.path),
      veiculos: formData.veiculos.filter((v) => v.marca.trim()),
      colaboracao: {
        limpeza: formData.colaboracao.limpeza
          ? {
              ativo: true,
              vezes_semana: Number(formData.colaboracao.limpeza_vezes_semana) || undefined,
            }
          : undefined,
        mutirao: formData.colaboracao.mutirao
          ? {
              ativo: true,
              sabados: Number(formData.colaboracao.mutirao_sabados) || undefined,
            }
          : undefined,
        arrecadacao: formData.colaboracao.arrecadacao || undefined,
        benfeitores: formData.colaboracao.benfeitores || undefined,
        outros: formData.colaboracao.outros || undefined,
      },
      indicacao_benfeitores: formData.indicacao_benfeitores.filter(
        (b) => b.nome.trim()
      ),
    };

    const result = await submitApplication(payload);

    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(
        result.errors?._form?.[0] ||
          "Erro ao enviar. Verifique os dados e tente novamente."
      );
    }
  }, [accepted, formData]);

  if (submitted) {
    return <SuccessScreen />;
  }

  return (
    <div>
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <form
        onSubmit={(e) => e.preventDefault()}
        noValidate
        data-testid="scholarship-form"
      >
        {currentStep === 1 && (
          <Step1Applicant
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2Students
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <Step3Income
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <Step4Expenses
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 5 && (
          <Step5Vehicles
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 6 && (
          <Step6Review
            data={formData}
            accepted={accepted}
            onAcceptedChange={(v) => {
              setAccepted(v);
              if (v) setAcceptError(false);
            }}
            acceptError={acceptError}
          />
        )}

        {submitError && (
          <p className="mt-4 text-center text-sm text-danger">{submitError}</p>
        )}

        <div className="mt-8 flex justify-between gap-3 max-sm:flex-col">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-md border border-border bg-surface px-7 py-3 text-sm font-medium tracking-wide text-fg transition-colors hover:bg-bg max-sm:w-full max-sm:text-center"
              data-testid="btn-prev"
            >
              Voltar
            </button>
          )}
          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto rounded-md bg-accent px-7 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-accent/90 active:translate-y-px max-sm:ml-0 max-sm:w-full max-sm:text-center"
              data-testid="btn-next"
            >
              Próximo
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="ml-auto rounded-md bg-accent px-7 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-accent/90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 max-sm:ml-0 max-sm:w-full max-sm:text-center"
              data-testid="btn-submit"
            >
              {submitting ? "Enviando..." : "Enviar Solicitação"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
