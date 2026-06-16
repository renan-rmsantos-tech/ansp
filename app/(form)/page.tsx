import { getActiveSchoolYear } from "./_actions/form-actions";
import { ScholarshipForm } from "./_components/scholarship-form";

export default async function FormPage() {
  const result = await getActiveSchoolYear();

  if (!result.open) {
    return (
      <div className="rounded-lg border border-border bg-surface px-8 py-12 text-center">
        <h2 className="font-display text-xl font-semibold text-fg">
          Inscrições Encerradas
        </h2>
        <p className="mx-auto mt-3 max-w-[42ch] text-[15px] text-muted">
          O período de inscrição para bolsas não está aberto no momento. Por
          favor, entre em contato com a secretaria da escola para mais
          informações.
        </p>
      </div>
    );
  }

  return <ScholarshipForm />;
}
