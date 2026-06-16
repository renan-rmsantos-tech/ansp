-- Migration: Trigger to enforce only one active school year
-- The unique partial index on school_years(ativo) WHERE ativo=true already prevents
-- two rows with ativo=true via INSERT. This trigger handles UPDATE: when a row is set
-- to ativo=true, all other rows are set to ativo=false first.

create or replace function public.enforce_single_active_school_year()
returns trigger as $$
begin
  if new.ativo = true then
    update public.school_years
    set ativo = false
    where ativo = true and id <> new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_enforce_single_active_school_year
  before insert or update of ativo on public.school_years
  for each row
  when (new.ativo = true)
  execute function public.enforce_single_active_school_year();
