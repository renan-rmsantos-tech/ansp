-- Migration: adiciona CPF (obrigatório) ao cadastro público de benfeitores.
-- O default temporário garante que eventuais linhas já existentes recebam um
-- valor antes de aplicar o NOT NULL; em seguida o default é removido para que
-- novos registros sempre informem o CPF explicitamente (validado na aplicação).

alter table public.donor_pledges
  add column cpf text not null default '';

alter table public.donor_pledges
  alter column cpf drop default;
