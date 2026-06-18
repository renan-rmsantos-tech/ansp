import { getDonorPledges } from "../_actions/admin-actions";
import { BenfeitoresClient } from "./client";
import type { DonorPledge } from "../_components/donor-card";

export default async function BenfeitoresPage() {
  const { data: donors } = await getDonorPledges();

  return (
    <div>
      <h1 className="font-heading text-[22px] font-semibold leading-tight tracking-tight">
        Benfeitores
      </h1>
      <p className="mt-1 text-sm text-muted">
        Cadastros recebidos pelo formulário público &ldquo;Seja um benfeitor&rdquo;.
      </p>
      <div className="mt-6">
        <BenfeitoresClient initialDonors={(donors as DonorPledge[]) ?? []} />
      </div>
    </div>
  );
}
