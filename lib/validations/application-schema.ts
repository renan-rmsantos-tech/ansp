import { z } from "zod";
import { isValidCPF } from "./cpf";

const cpfSchema = z
  .string()
  .min(1, "CPF é obrigatório")
  .refine((val) => isValidCPF(val), { message: "CPF inválido" });

const optionalCpfSchema = z
  .string()
  .optional()
  .refine((val) => !val || isValidCPF(val), { message: "CPF inválido" });

const nonNegativeNumber = z.number().min(0, "Valor não pode ser negativo");

const optionalNonNegative = nonNegativeNumber.optional();

const filePathArray = z.array(z.string().min(1)).default([]);

const studentSchema = z.object({
  nome: z.string().min(1, "Nome do aluno é obrigatório"),
  cpf: optionalCpfSchema,
  serie: z.string().min(1, "Série é obrigatória"),
  mensalidade: nonNegativeNumber,
  documentos: filePathArray,
});

const otherChildSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: optionalCpfSchema,
  nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
});

const vehicleSchema = z.object({
  marca: z.string().min(1, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  ano: z.string().min(1, "Ano é obrigatório"),
});

const benefactorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

const collaborationSchema = z.object({
  limpeza: z
    .object({
      ativo: z.boolean(),
      vezes_semana: z.number().int().positive().optional(),
    })
    .optional(),
  mutirao: z
    .object({
      ativo: z.boolean(),
      sabados: z.number().int().positive().optional(),
    })
    .optional(),
  arrecadacao: z.boolean().optional(),
  benfeitores: z.boolean().optional(),
  outros: z.string().optional(),
});

export const applicationSubmissionSchema = z.object({
  escola: z.string().min(1, "Nome da escola é obrigatório"),

  pai: z.object({
    nome: z.string().min(1, "Nome do pai é obrigatório"),
    rg: z.string().min(1, "RG do pai é obrigatório"),
    cpf: cpfSchema,
    profissao: z.string().optional(),
    documentos: filePathArray,
  }),

  mae: z.object({
    nome: z.string().min(1, "Nome da mãe é obrigatório"),
    cpf: cpfSchema,
    profissao: z.string().optional(),
    documentos: filePathArray,
  }),

  certidao_casamento: filePathArray.optional(),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  cep: z.string().optional(),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  comprovante_endereco: filePathArray,

  outros_filhos: z.array(otherChildSchema).default([]),

  alunos: z
    .array(studentSchema)
    .min(1, "É necessário informar pelo menos um aluno"),

  desconto_solicitado: z
    .number()
    .min(0, "Desconto não pode ser negativo")
    .max(100, "Desconto não pode exceder 100%"),

  renda: z.object({
    pai: optionalNonNegative,
    mae: optionalNonNegative,
    outros: optionalNonNegative,
    pessoas: z.number().int().positive("Número de pessoas deve ser positivo"),
  }),

  extrato_ir: filePathArray,

  despesas: z.object({
    aluguel: optionalNonNegative,
    servicos: optionalNonNegative,
    tv: optionalNonNegative,
    celular_plano: optionalNonNegative,
    celular_parcelas: optionalNonNegative,
    internet: optionalNonNegative,
  }),

  extratos_bancarios: filePathArray,

  veiculos: z.array(vehicleSchema).default([]),

  colaboracao: collaborationSchema,

  indicacao_benfeitores: z.array(benefactorSchema).default([]),
});

export type ApplicationSubmission = z.infer<
  typeof applicationSubmissionSchema
>;
