-- Migration: Create all tables for ANSP Scholarship Management System
-- Tables: school_years, applications, students, other_children, vehicles,
--         collaboration, benefactors, documents, decision_templates

-- 1. school_years
create table public.school_years (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data_inicio date not null,
  data_fim date not null,
  ativo boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index school_years_only_one_active
  on public.school_years (ativo) where (ativo = true);

-- 2. applications
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  school_year_id uuid not null references public.school_years(id),
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovada', 'rejeitada')),
  escola text not null,
  pai_nome text not null,
  pai_rg text not null,
  pai_cpf text not null,
  pai_profissao text,
  mae_nome text not null,
  mae_cpf text not null,
  mae_profissao text,
  endereco text not null,
  cep text,
  telefone text not null,
  email text,
  renda_pai numeric(12,2),
  renda_mae numeric(12,2),
  renda_outros numeric(12,2),
  pessoas_domicilio integer not null,
  despesa_aluguel numeric(12,2),
  despesa_servicos numeric(12,2),
  despesa_tv numeric(12,2),
  despesa_celular_plano numeric(12,2),
  despesa_celular_parcelas numeric(12,2),
  despesa_internet numeric(12,2),
  desconto_solicitado numeric(5,2) not null,
  desconto_concedido numeric(5,2),
  motivo text,
  data_envio timestamptz not null default now(),
  data_decisao timestamptz,
  decided_by uuid references auth.users(id)
);

create index applications_status_data_envio_idx
  on public.applications (status, data_envio);

create index applications_school_year_id_idx
  on public.applications (school_year_id);

-- 3. students
create table public.students (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  nome text not null,
  cpf text,
  serie text not null,
  mensalidade numeric(12,2) not null
);

create index students_application_id_idx on public.students (application_id);

-- 4. other_children
create table public.other_children (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  nome text not null,
  cpf text,
  nascimento date not null
);

create index other_children_application_id_idx on public.other_children (application_id);

-- 5. vehicles
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  marca text not null,
  modelo text not null,
  ano text not null
);

create index vehicles_application_id_idx on public.vehicles (application_id);

-- 6. collaboration
create table public.collaboration (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade unique,
  limpeza boolean not null default false,
  limpeza_vezes_semana integer,
  mutirao boolean not null default false,
  mutirao_sabados integer,
  arrecadacao boolean not null default false,
  buscar_benfeitores boolean not null default false,
  outros text
);

create index collaboration_application_id_idx on public.collaboration (application_id);

-- 7. benefactors
create table public.benefactors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  nome text not null,
  email text
);

create index benefactors_application_id_idx on public.benefactors (application_id);

-- 8. documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  categoria text not null,
  student_id uuid references public.students(id),
  storage_path text not null,
  nome_arquivo text not null,
  mime_type text not null,
  tamanho_bytes integer not null,
  uploaded_at timestamptz not null default now()
);

create index documents_application_id_idx on public.documents (application_id);
create index documents_student_id_idx on public.documents (student_id) where (student_id is not null);

-- 9. decision_templates
create table public.decision_templates (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('aprovacao', 'rejeicao')),
  cabecalho text not null,
  corpo text not null,
  rodape text not null,
  updated_at timestamptz not null default now()
);
