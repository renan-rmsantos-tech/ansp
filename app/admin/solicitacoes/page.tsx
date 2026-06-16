import { getApplications } from "../_actions/admin-actions";
import { SolicitacoesClient } from "./client";

export default async function SolicitacoesPage() {
  const { data: applications } = await getApplications();

  return (
    <div>
      <h1 className="font-heading text-[22px] font-semibold leading-tight tracking-tight">
        Solicitações de Bolsa
      </h1>
      <div className="mt-6">
        <SolicitacoesClient initialApplications={applications ?? []} />
      </div>
    </div>
  );
}
