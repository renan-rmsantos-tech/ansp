-- Migration: Privilégios de tabela para os papéis do Supabase.
-- As migrations anteriores criam as tabelas e habilitam RLS, mas não concedem
-- os GRANTs de tabela que o Supabase espera. Sem eles, mesmo com policies de RLS
-- corretas, anon/authenticated/service_role recebem "permission denied" (42501).
-- A RLS continua sendo a camada que restringe as linhas; o GRANT só dá acesso
-- à tabela. service_role ignora RLS (uso server-only).

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- Garante os mesmos privilégios para objetos criados futuramente em migrations.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;
