"use server";

import { createClient } from "@/lib/supabase/server";
import { replaceTokens, type TokenData } from "@/lib/templates/token-replacer";

type ActionResult = { success: boolean; error?: string };

async function requireAuth() {
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

export async function getDocumentUrl(
  path: string
): Promise<{ url: string } | { error: string }> {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 300);

  if (error || !data) {
    return { error: "Erro ao gerar URL do documento." };
  }

  return { url: data.signedUrl };
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
      decided_by: user.id,
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
      decided_by: user.id,
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
): Promise<{ content: string; filename: string } | { error: string }> {
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

  const fullTemplate = [template.cabecalho, template.corpo, template.rodape].join(
    "\n\n"
  );
  const content = replaceTokens(fullTemplate, tokenData);

  const safeNome = app.pai_nome.replace(/[^a-zA-Z0-9À-ú ]/g, "").replace(/\s+/g, "_");
  const filename = `decisao_${templateTipo}_${safeNome}.txt`;

  return { content, filename };
}
