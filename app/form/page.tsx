import { getActiveSchoolYear } from "./_actions/form-actions";
import { FormUnavailableMessage } from "./_components/form-unavailable-message";
import { ScholarshipForm } from "./_components/scholarship-form";

export default async function FormPage() {
  const result = await getActiveSchoolYear();

  if (!result.open) {
    return <FormUnavailableMessage />;
  }

  return <ScholarshipForm />;
}
