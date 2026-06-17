"use server";

import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { replaceTokens, type TokenData } from "@/lib/templates/token-replacer";
import {
  replaceContractTokens,
  formatDataExtenso,
  type ContractClause,
  type ContractTokenData,
} from "@/lib/templates/contract-tokens";
import { BYPASS_USER, isAuthBypass } from "@/lib/auth/bypass";

type ActionResult = { success: boolean; error?: string };

function resolveDecidedBy(userId: string): string | null {
  // Auth bypass uses a placeholder UUID that does not exist in auth.users.
  if (isAuthBypass() && userId === BYPASS_USER.id) {
    return null;
  }
  return userId;
}

async function requireAuth() {
  if (isAuthBypass()) {
    const cookieStore = await cookies();
    const devAuth = cookieStore.get("dev-auth")?.value;
    if (devAuth !== "true") {
      throw new Error("Não autorizado. Faça login para continuar.");
    }
    // Sem sessão real, o papel no Postgres seria `anon` e a RLS bloquearia
    // as escritas admin. A service_role ignora RLS (uso server-only).
    const supabase = createServiceClient();
    return { supabase, user: BYPASS_USER };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado. Faça login para continuar.");
  }

  return { supabase, user };
}

// --- Applications ---

export async function getApplications(
  filter?: "pendente" | "aprovada" | "rejeitada"
) {
  const { supabase } = await requireAuth();

  let query = supabase
    .from("applications")
    .select("*, students(*)")
    .order("data_envio", { ascending: false });

  if (filter) {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: "Erro ao buscar solicitações." };
  }

  return { data, error: null };
}

export async function getApplicationDetail(id: string) {
  const { supabase } = await requireAuth();

  const [
    appResult,
    studentsResult,
    childrenResult,
    vehiclesResult,
    collabResult,
    benefactorsResult,
    docsResult,
  ] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).single(),
    supabase.from("students").select("*").eq("application_id", id),
    supabase.from("other_children").select("*").eq("application_id", id),
    supabase.from("vehicles").select("*").eq("application_id", id),
    supabase
      .from("collaboration")
      .select("*")
      .eq("application_id", id)
      .single(),
    supabase.from("benefactors").select("*").eq("application_id", id),
    supabase.from("documents").select("*").eq("application_id", id),
  ]);

  if (appResult.error || !appResult.data) {
    return { data: null, error: "Solicitação não encontrada." };
  }

  return {
    data: {
      ...appResult.data,
      students: studentsResult.data ?? [],
      other_children: childrenResult.data ?? [],
      vehicles: vehiclesResult.data ?? [],
      collaboration: collabResult.data ?? null,
      benefactors: benefactorsResult.data ?? [],
      documents: docsResult.data ?? [],
    },
    error: null,
  };
}

// --- Document URL ---

function resolveDocumentPaths(path: string, applicationId?: string): string[] {
  const paths = [path];

  if (path.startsWith("pending/") && applicationId) {
    const rest = path.replace(/^pending\/[^/]+\//, "");
    if (rest) {
      paths.push(`applications/${applicationId}/${rest}`);
    }
  }

  return paths;
}

export async function getDocumentUrl(
  path: string,
  applicationId?: string
): Promise<{ url: string } | { error: string }> {
  const { supabase } = await requireAuth();

  for (const candidate of resolveDocumentPaths(path, applicationId)) {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(candidate, 300);

    if (!error && data?.signedUrl) {
      return { url: data.signedUrl };
    }
  }

  return { error: "Erro ao gerar URL do documento." };
}

// --- Decisions ---

export async function approveApplication(
  id: string,
  desconto: number,
  motivo?: string
): Promise<ActionResult> {
  if (desconto < 0 || desconto > 100) {
    return { success: false, error: "Desconto deve estar entre 0 e 100." };
  }

  const { supabase, user } = await requireAuth();

  const { error } = await supabase
    .from("applications")
    .update({
      status: "aprovada",
      desconto_concedido: desconto,
      motivo: motivo || null,
      data_decisao: new Date().toISOString(),
      decided_by: resolveDecidedBy(user.id),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao aprovar solicitação." };
  }

  return { success: true };
}

export async function rejectApplication(
  id: string,
  motivo?: string
): Promise<ActionResult> {
  const { supabase, user } = await requireAuth();

  const { error } = await supabase
    .from("applications")
    .update({
      status: "rejeitada",
      motivo: motivo || null,
      data_decisao: new Date().toISOString(),
      decided_by: resolveDecidedBy(user.id),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao rejeitar solicitação." };
  }

  return { success: true };
}

// --- School Years ---

export async function getSchoolYears() {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase
    .from("school_years")
    .select("*")
    .order("data_inicio", { ascending: false });

  if (error) {
    return { data: null, error: "Erro ao buscar anos letivos." };
  }

  return { data, error: null };
}

export async function createSchoolYear(input: {
  nome: string;
  data_inicio: string;
  data_fim: string;
}): Promise<ActionResult> {
  if (new Date(input.data_fim) < new Date(input.data_inicio)) {
    return {
      success: false,
      error: "Data de fim deve ser posterior à data de início.",
    };
  }

  const { supabase } = await requireAuth();

  const { error } = await supabase.from("school_years").insert({
    nome: input.nome,
    data_inicio: input.data_inicio,
    data_fim: input.data_fim,
    ativo: false,
  });

  if (error) {
    return { success: false, error: "Erro ao criar ano letivo." };
  }

  return { success: true };
}

export async function toggleSchoolYear(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth();

  const { data: current, error: fetchError } = await supabase
    .from("school_years")
    .select("ativo")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return { success: false, error: "Ano letivo não encontrado." };
  }

  const { error } = await supabase
    .from("school_years")
    .update({ ativo: !current.ativo })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao atualizar ano letivo." };
  }

  return { success: true };
}

export async function deleteSchoolYear(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth();

  const { error } = await supabase.from("school_years").delete().eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao excluir ano letivo." };
  }

  return { success: true };
}

// --- Decision Templates ---

export async function getTemplates() {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase
    .from("decision_templates")
    .select("*")
    .order("tipo");

  if (error) {
    return { data: null, error: "Erro ao buscar modelos de decisão." };
  }

  return { data, error: null };
}

export async function saveTemplate(input: {
  tipo: "aprovacao" | "rejeicao";
  cabecalho: string;
  corpo: string;
  rodape: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();

  const { data: existing } = await supabase
    .from("decision_templates")
    .select("id")
    .eq("tipo", input.tipo)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("decision_templates")
      .update({
        cabecalho: input.cabecalho,
        corpo: input.corpo,
        rodape: input.rodape,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: "Erro ao atualizar modelo." };
    }
  } else {
    const { error } = await supabase.from("decision_templates").insert({
      tipo: input.tipo,
      cabecalho: input.cabecalho,
      corpo: input.corpo,
      rodape: input.rodape,
    });

    if (error) {
      return { success: false, error: "Erro ao criar modelo." };
    }
  }

  return { success: true };
}

// --- Decision Export ---

export async function exportDecision(
  id: string
): Promise<{ pdfBase64: string; filename: string } | { error: string }> {
  const { supabase } = await requireAuth();

  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("*, students(*), school_years!inner(nome)")
    .eq("id", id)
    .single();

  if (appError || !app) {
    return { error: "Solicitação não encontrada." };
  }

  if (app.status === "pendente") {
    return { error: "Solicitação ainda não foi decidida." };
  }

  const templateTipo =
    app.status === "aprovada" ? "aprovacao" : "rejeicao";

  const { data: template, error: templateError } = await supabase
    .from("decision_templates")
    .select("*")
    .eq("tipo", templateTipo)
    .single();

  if (templateError || !template) {
    return { error: "Modelo de decisão não encontrado." };
  }

  const tokenData: TokenData = {
    nome_pai: app.pai_nome,
    nome_mae: app.mae_nome,
    escola: app.escola,
    alunos: (app.students ?? []).map(
      (s: { nome: string }) => s.nome
    ),
    desconto: app.desconto_concedido?.toString() ?? "0",
    data: app.data_decisao
      ? new Date(app.data_decisao).toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR"),
    motivo: app.motivo,
    ano_letivo: app.school_years?.nome ?? "",
  };

  const resolved = {
    titulo: `Decisão - ${app.escola}`,
    cabecalho: replaceTokens(template.cabecalho, tokenData),
    corpo: replaceTokens(template.corpo, tokenData),
    rodape: replaceTokens(template.rodape, tokenData),
  };

  const { renderDecisionPdf } = await import("@/lib/pdf/decision-pdf");
  const pdf = await renderDecisionPdf(resolved);

  const safeNome = app.pai_nome.replace(/[^a-zA-Z0-9À-ú ]/g, "").replace(/\s+/g, "_");
  const filename = `decisao_${templateTipo}_${safeNome}.pdf`;

  return { pdfBase64: pdf.toString("base64"), filename };
}

// --- Contract Template ---

export interface ContractTemplate {
  id: string;
  titulo: string;
  cabecalho: string;
  clausulas: ContractClause[];
  rodape: string;
}

export async function getContractTemplate() {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase
    .from("contract_templates")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: "Erro ao buscar modelo de contrato." };
  }

  return { data: data as ContractTemplate | null, error: null };
}

export async function saveContractTemplate(input: {
  titulo: string;
  cabecalho: string;
  clausulas: ContractClause[];
  rodape: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();

  const { data: existing } = await supabase
    .from("contract_templates")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    titulo: input.titulo,
    cabecalho: input.cabecalho,
    clausulas: input.clausulas,
    rodape: input.rodape,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("contract_templates")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: "Erro ao atualizar modelo de contrato." };
    }
  } else {
    const { error } = await supabase.from("contract_templates").insert(payload);

    if (error) {
      return { success: false, error: "Erro ao criar modelo de contrato." };
    }
  }

  return { success: true };
}

// Formata 'YYYY-MM-DD' como 'DD/MM/YYYY' sem depender de fuso horário.
function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return d && m && y ? `${d}/${m}/${y}` : isoDate;
}

// --- Contract Export (PDF) ---

export async function exportContract(
  id: string
): Promise<{ pdfBase64: string; filename: string } | { error: string }> {
  const { supabase } = await requireAuth();

  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("*, students(*), school_years!inner(nome, data_inicio, data_fim)")
    .eq("id", id)
    .single();

  if (appError || !app) {
    return { error: "Solicitação não encontrada." };
  }

  if (app.status !== "aprovada") {
    return {
      error: "O contrato só pode ser gerado para solicitações aprovadas.",
    };
  }

  const { data: template, error: templateError } = await getContractTemplate();

  if (templateError || !template) {
    return { error: "Modelo de contrato não encontrado." };
  }

  const tokenData: ContractTokenData = {
    aluno: (app.students ?? []).map((s: { nome: string }) => s.nome).join(", "),
    nome_responsavel: app.pai_nome,
    rg_responsavel: app.pai_rg ?? "",
    cpf_responsavel: app.pai_cpf ?? "",
    endereco: app.cep ? `${app.endereco}, CEP ${app.cep}` : app.endereco,
    desconto: app.desconto_concedido?.toString() ?? "0",
    ano_letivo: app.school_years?.nome ?? "",
    data_inicio: app.school_years?.data_inicio
      ? formatDateBR(app.school_years.data_inicio)
      : "",
    data_termino: app.school_years?.data_fim
      ? formatDateBR(app.school_years.data_fim)
      : "",
    data_extenso: formatDataExtenso(new Date()),
  };

  const resolved = {
    titulo: replaceContractTokens(template.titulo, tokenData),
    cabecalho: replaceContractTokens(template.cabecalho, tokenData),
    clausulas: (template.clausulas ?? []).map((c) => ({
      titulo: replaceContractTokens(c.titulo, tokenData),
      corpo: replaceContractTokens(c.corpo, tokenData),
    })),
    rodape: replaceContractTokens(template.rodape, tokenData),
  };

  const { renderContractPdf } = await import("@/lib/pdf/contract-pdf");
  const pdf = await renderContractPdf(resolved);

  const safeNome = app.pai_nome
    .replace(/[^a-zA-Z0-9À-ú ]/g, "")
    .replace(/\s+/g, "_");
  const filename = `contrato_${safeNome}.pdf`;

  return { pdfBase64: pdf.toString("base64"), filename };
}
