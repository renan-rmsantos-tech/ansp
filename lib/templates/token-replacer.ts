interface TokenData {
  nome_pai: string;
  nome_mae: string;
  escola: string;
  alunos: string[];
  desconto: string;
  data: string;
  motivo?: string | null;
  ano_letivo: string;
}

const TOKEN_MAP: Record<string, (d: TokenData) => string> = {
  "{nome_pai}": (d) => d.nome_pai,
  "{nome_mae}": (d) => d.nome_mae,
  "{escola}": (d) => d.escola,
  "{aluno}": (d) => d.alunos.join(", "),
  "{desconto}": (d) => d.desconto,
  "{data}": (d) => d.data,
  "{motivo}": (d) => d.motivo || "",
  "{ano_letivo}": (d) => d.ano_letivo,
};

export function replaceTokens(template: string, data: TokenData): string {
  let result = template;
  for (const [token, resolver] of Object.entries(TOKEN_MAP)) {
    result = result.replaceAll(token, resolver(data));
  }
  return result;
}

export type { TokenData };
