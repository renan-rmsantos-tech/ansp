"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  applicationSubmissionSchema,
  type ApplicationSubmission,
} from "@/lib/validations/application-schema";
import { randomUUID } from "crypto";

interface SchoolYear {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
}

export async function getActiveSchoolYear(): Promise<{
  open: boolean;
  year?: SchoolYear;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("school_years")
    .select("*")
    .eq("ativo", true)
    .single();

  if (error || !data) {
    return { open: false };
  }

  const now = new Date();
  const start = new Date(data.data_inicio + "T00:00:00");
  const end = new Date(data.data_fim + "T23:59:59");

  if (now < start || now > end) {
    return { open: false };
  }

  return { open: true, year: data as SchoolYear };
}

export async function createSignedUploadUrl(
  filename: string,
  category: string
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();

  const uuid = randomUUID();
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `pending/${uuid}/${category}/${sanitized}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUploadUrl(path, { upsert: false });

  if (error) {
    return { error: "Erro ao gerar URL de upload. Tente novamente." };
  }

  return { url: data.signedUrl, path };
}

export async function submitApplication(
  input: ApplicationSubmission
): Promise<{ success: boolean; id?: string; errors?: Record<string, string[]> }> {
  const result = applicationSubmissionSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { success: false, errors: fieldErrors };
  }

  const data = result.data;
  // Server action confiável: usa service role para persistir a solicitação
  // (o papel anon só tem INSERT; o .select() após insert exige leitura).
  const supabase = createServiceClient();

  const { data: activeYear, error: yearError } = await supabase
    .from("school_years")
    .select("id")
    .eq("ativo", true)
    .single();

  if (yearError || !activeYear) {
    return {
      success: false,
      errors: {
        _form: ["O período de inscrição não está aberto no momento."],
      },
    };
  }

  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      school_year_id: activeYear.id,
      escola: data.escola,
      pai_nome: data.pai.nome,
      pai_rg: data.pai.rg,
      pai_cpf: data.pai.cpf.replace(/\D/g, ""),
      pai_profissao: data.pai.profissao || null,
      mae_nome: data.mae.nome,
      mae_cpf: data.mae.cpf.replace(/\D/g, ""),
      mae_profissao: data.mae.profissao || null,
      endereco: data.endereco,
      cep: data.cep || null,
      telefone: data.telefone,
      email: data.email || null,
      renda_pai: data.renda.pai ?? null,
      renda_mae: data.renda.mae ?? null,
      renda_outros: data.renda.outros ?? null,
      pessoas_domicilio: data.renda.pessoas,
      despesa_aluguel: data.despesas.aluguel ?? null,
      despesa_servicos: data.despesas.servicos ?? null,
      despesa_tv: data.despesas.tv ?? null,
      despesa_celular_plano: data.despesas.celular_plano ?? null,
      despesa_celular_parcelas: data.despesas.celular_parcelas ?? null,
      despesa_internet: data.despesas.internet ?? null,
      desconto_solicitado: data.desconto_solicitado,
    })
    .select("id")
    .single();

  if (appError || !application) {
    return {
      success: false,
      errors: {
        _form: ["Erro ao salvar a solicitação. Tente novamente."],
      },
    };
  }

  const appId = application.id;

  const { data: insertedStudents, error: studentsError } = await supabase
    .from("students")
    .insert(
      data.alunos.map((s) => ({
        application_id: appId,
        nome: s.nome,
        cpf: s.cpf?.replace(/\D/g, "") || null,
        serie: s.serie,
        mensalidade: s.mensalidade,
      }))
    )
    .select("id, nome");

  if (studentsError) {
    return {
      success: false,
      errors: { _form: ["Erro ao salvar dados dos alunos."] },
    };
  }

  const promises: PromiseLike<unknown>[] = [];

  if (data.outros_filhos.length > 0) {
    promises.push(
      supabase.from("other_children").insert(
        data.outros_filhos.map((c) => ({
          application_id: appId,
          nome: c.nome,
          cpf: c.cpf?.replace(/\D/g, "") || null,
          nascimento: c.nascimento,
        }))
      )
    );
  }

  if (data.veiculos.length > 0) {
    promises.push(
      supabase.from("vehicles").insert(
        data.veiculos.map((v) => ({
          application_id: appId,
          marca: v.marca,
          modelo: v.modelo,
          ano: v.ano,
        }))
      )
    );
  }

  promises.push(
    supabase.from("collaboration").insert({
      application_id: appId,
      limpeza: data.colaboracao.limpeza?.ativo ?? false,
      limpeza_vezes_semana: data.colaboracao.limpeza?.vezes_semana ?? null,
      mutirao: data.colaboracao.mutirao?.ativo ?? false,
      mutirao_sabados: data.colaboracao.mutirao?.sabados ?? null,
      arrecadacao: data.colaboracao.arrecadacao ?? false,
      buscar_benfeitores: data.colaboracao.benfeitores ?? false,
      outros: data.colaboracao.outros ?? null,
    })
  );

  if (data.indicacao_benfeitores.length > 0) {
    promises.push(
      supabase.from("benefactors").insert(
        data.indicacao_benfeitores.map((b) => ({
          application_id: appId,
          nome: b.nome,
          email: b.email,
        }))
      )
    );
  }

  const documentRows = collectDocumentRows(data, appId, insertedStudents ?? []);
  await moveFilesToApplication(supabase, documentRows, appId);

  if (documentRows.length > 0) {
    promises.push(supabase.from("documents").insert(documentRows));
  }

  await Promise.all(promises);

  return { success: true, id: appId };
}

function collectDocumentRows(
  data: ApplicationSubmission,
  appId: string,
  students: Array<{ id: string; nome: string }>
) {
  const rows: Array<{
    application_id: string;
    categoria: string;
    student_id: string | null;
    storage_path: string;
    nome_arquivo: string;
    mime_type: string;
    tamanho_bytes: number;
  }> = [];

  const addDocs = (
    paths: string[],
    categoria: string,
    studentId: string | null = null
  ) => {
    for (const path of paths) {
      rows.push({
        application_id: appId,
        categoria,
        student_id: studentId,
        storage_path: path,
        nome_arquivo: path.split("/").pop() || path,
        mime_type: guessMimeType(path),
        tamanho_bytes: 0,
      });
    }
  };

  addDocs(data.pai.documentos, "rg_pai");
  addDocs(data.mae.documentos, "rg_mae");
  if (data.certidao_casamento) addDocs(data.certidao_casamento, "certidao");
  addDocs(data.comprovante_endereco, "comprovante_endereco");
  addDocs(data.extrato_ir, "extrato_ir");
  addDocs(data.extratos_bancarios, "extrato_bancario");

  for (const aluno of data.alunos) {
    const match = students.find((s) => s.nome === aluno.nome);
    addDocs(aluno.documentos, "rg_aluno", match?.id ?? null);
  }

  return rows;
}

function guessMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function moveFilesToApplication(
  supabase: Awaited<ReturnType<typeof createClient>>,
  documentRows: Array<{ storage_path: string }>,
  appId: string
) {
  for (const doc of documentRows) {
    if (doc.storage_path.startsWith("pending/")) {
      const newPath = doc.storage_path.replace(
        /^pending\/[^/]+/,
        `applications/${appId}`
      );
      await supabase.storage.from("documents").move(doc.storage_path, newPath);
      doc.storage_path = newPath;
    }
  }
}
