// Tokens disponíveis no modelo de contrato. Cada token é substituído pelos
// dados cadastrados para a solicitação de bolsa no momento da geração do PDF.

export interface ContractClause {
  titulo: string;
  corpo: string;
}

export interface ContractTokenData {
  aluno: string;
  nome_responsavel: string;
  rg_responsavel: string;
  cpf_responsavel: string;
  endereco: string;
  desconto: string;
  ano_letivo: string;
  data_inicio: string;
  data_termino: string;
  data_extenso: string;
}

export const AVAILABLE_CONTRACT_TOKENS: { token: string; desc: string }[] = [
  { token: "{aluno}", desc: "Nome(s) do(s) aluno(s)" },
  { token: "{nome_responsavel}", desc: "Nome do responsável legal" },
  { token: "{rg_responsavel}", desc: "RG do responsável" },
  { token: "{cpf_responsavel}", desc: "CPF do responsável" },
  { token: "{endereco}", desc: "Endereço completo" },
  { token: "{desconto}", desc: "Percentual da bolsa (%)" },
  { token: "{ano_letivo}", desc: "Ano letivo" },
  { token: "{data_inicio}", desc: "Início da vigência" },
  { token: "{data_termino}", desc: "Término da vigência" },
  { token: "{data_extenso}", desc: "Data e local por extenso" },
];

const TOKEN_MAP: Record<string, (d: ContractTokenData) => string> = {
  "{aluno}": (d) => d.aluno,
  "{nome_responsavel}": (d) => d.nome_responsavel,
  "{rg_responsavel}": (d) => d.rg_responsavel,
  "{cpf_responsavel}": (d) => d.cpf_responsavel,
  "{endereco}": (d) => d.endereco,
  "{desconto}": (d) => d.desconto,
  "{ano_letivo}": (d) => d.ano_letivo,
  "{data_inicio}": (d) => d.data_inicio,
  "{data_termino}": (d) => d.data_termino,
  "{data_extenso}": (d) => d.data_extenso,
};

export function replaceContractTokens(
  text: string,
  data: ContractTokenData
): string {
  let result = text;
  for (const [token, resolver] of Object.entries(TOKEN_MAP)) {
    result = result.replaceAll(token, resolver(data));
  }
  return result;
}

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

// "Itatiba - SP, 17 de junho de 2026"
export function formatDataExtenso(date: Date, cidadeUf = "Itatiba - SP"): string {
  return `${cidadeUf}, ${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

export const SAMPLE_CONTRACT_DATA: ContractTokenData = {
  aluno: "Pedro da Silva",
  nome_responsavel: "João da Silva",
  rg_responsavel: "12.345.678-9",
  cpf_responsavel: "123.456.789-00",
  endereco: "Rua das Flores, 123, Centro, Itatiba - SP, CEP 13250-000",
  desconto: "50",
  ano_letivo: "2026",
  data_inicio: "01/02/2026",
  data_termino: "30/11/2026",
  data_extenso: "Itatiba - SP, 17 de junho de 2026",
};
