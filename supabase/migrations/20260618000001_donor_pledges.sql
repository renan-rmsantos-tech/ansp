-- Migration: tabela donor_pledges para o cadastro público "Seja um benfeitor".
-- Registra doações (únicas ou mensais) feitas por benfeitores que apoiam as
-- bolsas de estudo. Não tem relação com a tabela `benefactors`, que apenas
-- guarda indicações de benfeitores feitas dentro de uma solicitação de bolsa.

create table public.donor_pledges (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  -- frequência da doação: uma vez (unica) ou mensal
  frequencia text not null check (frequencia in ('unica', 'mensal')),
  -- duração quando mensal: por um ano (um_ano) ou indeterminado
  duracao text check (duracao in ('um_ano', 'indeterminado')),
  valor numeric(12,2) not null check (valor > 0),
  meio_pagamento text not null
    check (meio_pagamento in ('cartao', 'boleto', 'transferencia', 'pix')),
  -- data preferida de pagamento (usada para o lembrete mensal)
  data_pagamento date,
  -- canal do lembrete mensal: whatsapp ou email
  lembrete_canal text check (lembrete_canal in ('whatsapp', 'email')),
  telefone text,
  observacoes text,
  created_at timestamptz not null default now()
);

create index donor_pledges_created_at_idx on public.donor_pledges (created_at desc);

-- RLS: o formulário público (anon) só insere; admin (authenticated) lê.
alter table public.donor_pledges enable row level security;

create policy "donor_pledges_insert_anon"
  on public.donor_pledges for insert
  to anon
  with check (true);

create policy "donor_pledges_select_auth"
  on public.donor_pledges for select
  to authenticated
  using (true);

create policy "donor_pledges_update_auth"
  on public.donor_pledges for update
  to authenticated
  using (true)
  with check (true);

create policy "donor_pledges_delete_auth"
  on public.donor_pledges for delete
  to authenticated
  using (true);

-- GRANTs (a RLS continua restringindo as linhas; ver migration 20260616000005).
grant all on public.donor_pledges to anon, authenticated, service_role;
