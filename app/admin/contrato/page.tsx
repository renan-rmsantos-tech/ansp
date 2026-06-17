import { getContractTemplate } from "../_actions/admin-actions";
import { ContractTemplateEditor } from "../_components/contract-template-editor";

export default async function ContratoPage() {
  const { data: template } = await getContractTemplate();

  return (
    <div>
      <h1 className="font-heading text-[22px] font-semibold leading-tight tracking-tight">
        Modelo de Contrato
      </h1>
      <p className="mt-1 text-sm text-muted">
        Edite o texto e o formato do contrato de concessão de bolsa. Os tokens
        são substituídos pelos dados da solicitação ao gerar o PDF.
      </p>
      <div className="mt-6">
        <ContractTemplateEditor initialTemplate={template} />
      </div>
    </div>
  );
}
