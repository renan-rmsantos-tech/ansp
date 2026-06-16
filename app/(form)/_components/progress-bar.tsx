"use client";

const STEP_NAMES = [
  "1. Dados dos Pais",
  "2. Dados dos Alunos",
  "3. Renda Familiar",
  "4. Despesas Mensais",
  "5. Veículos e Benfeitores",
  "6. Revisão e Envio",
];

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressBar({
  currentStep,
  totalSteps = 6,
}: ProgressBarProps) {
  return (
    <nav
      className="sticky top-0 z-50 bg-bg pb-4 pt-4"
      aria-label="Progresso do formulário"
    >
      <div className="mb-2 flex justify-between text-xs tracking-wide text-muted">
        <span className="font-medium text-accent">
          {STEP_NAMES[currentStep - 1]}
        </span>
        <span>
          Etapa {currentStep} de {totalSteps}
        </span>
      </div>
      <div className="flex gap-1.5" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          let className = "h-1 flex-1 rounded-sm transition-colors duration-300 ";
          if (step < currentStep) className += "bg-gold";
          else if (step === currentStep) className += "bg-accent";
          else className += "bg-border";
          return (
            <div
              key={step}
              className={className}
              data-testid={`progress-step-${step}`}
              data-state={
                step < currentStep
                  ? "done"
                  : step === currentStep
                    ? "active"
                    : "pending"
              }
            />
          );
        })}
      </div>
    </nav>
  );
}
