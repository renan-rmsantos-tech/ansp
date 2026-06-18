-- Migration: cabeçalho institucional compartilhado pelos documentos gerados
-- (Decisão e Contrato). O selo da ANSP é fixo (renderizado pela aplicação);
-- aqui ficam apenas as linhas de texto configuráveis pelo admin.

create table public.document_header (
  id uuid primary key default gen_random_uuid(),
  -- linhas de texto do cabeçalho (linha1 costuma ser o nome da instituição)
  linha1 text not null default 'Arca Nossa Senhora da Providência',
  linha2 text not null default '',
  linha3 text not null default '',
  -- exibir o selo da ANSP no topo dos documentos
  mostrar_selo boolean not null default true,
  updated_at timestamptz not null default now()
);

-- RLS: somente admins (authenticated) leem e escrevem; service_role server-only.
alter table public.document_header enable row level security;

create policy "document_header_select_auth"
  on public.document_header for select
  to authenticated
  using (true);

create policy "document_header_insert_auth"
  on public.document_header for insert
  to authenticated
  with check (true);

create policy "document_header_update_auth"
  on public.document_header for update
  to authenticated
  using (true)
  with check (true);

grant all on public.document_header to authenticated, service_role;

-- Linha inicial padrão para já existir um cabeçalho configurável.
insert into public.document_header (linha1, linha2, linha3)
values (
  'Arca Nossa Senhora da Providência',
  'Mantenedora do Colégio São José — Itatiba/SP',
  ''
);
