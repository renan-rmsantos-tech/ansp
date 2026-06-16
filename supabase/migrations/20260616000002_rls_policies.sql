-- Migration: Row Level Security policies for all tables

-- Enable RLS on all tables
alter table public.school_years enable row level security;
alter table public.applications enable row level security;
alter table public.students enable row level security;
alter table public.other_children enable row level security;
alter table public.vehicles enable row level security;
alter table public.collaboration enable row level security;
alter table public.benefactors enable row level security;
alter table public.documents enable row level security;
alter table public.decision_templates enable row level security;

-- school_years: anon SELECT, auth full CRUD
create policy "school_years_select_public"
  on public.school_years for select
  to anon, authenticated
  using (true);

create policy "school_years_insert_auth"
  on public.school_years for insert
  to authenticated
  with check (true);

create policy "school_years_update_auth"
  on public.school_years for update
  to authenticated
  using (true)
  with check (true);

create policy "school_years_delete_auth"
  on public.school_years for delete
  to authenticated
  using (true);

-- decision_templates: anon SELECT, auth full CRUD
create policy "decision_templates_select_public"
  on public.decision_templates for select
  to anon, authenticated
  using (true);

create policy "decision_templates_insert_auth"
  on public.decision_templates for insert
  to authenticated
  with check (true);

create policy "decision_templates_update_auth"
  on public.decision_templates for update
  to authenticated
  using (true)
  with check (true);

create policy "decision_templates_delete_auth"
  on public.decision_templates for delete
  to authenticated
  using (true);

-- applications: anon INSERT, auth SELECT/UPDATE
create policy "applications_insert_anon"
  on public.applications for insert
  to anon
  with check (true);

create policy "applications_select_auth"
  on public.applications for select
  to authenticated
  using (true);

create policy "applications_update_auth"
  on public.applications for update
  to authenticated
  using (true)
  with check (true);

-- students: anon INSERT, auth SELECT/UPDATE
create policy "students_insert_anon"
  on public.students for insert
  to anon
  with check (true);

create policy "students_select_auth"
  on public.students for select
  to authenticated
  using (true);

create policy "students_update_auth"
  on public.students for update
  to authenticated
  using (true)
  with check (true);

-- other_children: anon INSERT, auth SELECT/UPDATE
create policy "other_children_insert_anon"
  on public.other_children for insert
  to anon
  with check (true);

create policy "other_children_select_auth"
  on public.other_children for select
  to authenticated
  using (true);

create policy "other_children_update_auth"
  on public.other_children for update
  to authenticated
  using (true)
  with check (true);

-- vehicles: anon INSERT, auth SELECT/UPDATE
create policy "vehicles_insert_anon"
  on public.vehicles for insert
  to anon
  with check (true);

create policy "vehicles_select_auth"
  on public.vehicles for select
  to authenticated
  using (true);

create policy "vehicles_update_auth"
  on public.vehicles for update
  to authenticated
  using (true)
  with check (true);

-- collaboration: anon INSERT, auth SELECT/UPDATE
create policy "collaboration_insert_anon"
  on public.collaboration for insert
  to anon
  with check (true);

create policy "collaboration_select_auth"
  on public.collaboration for select
  to authenticated
  using (true);

create policy "collaboration_update_auth"
  on public.collaboration for update
  to authenticated
  using (true)
  with check (true);

-- benefactors: anon INSERT, auth SELECT/UPDATE
create policy "benefactors_insert_anon"
  on public.benefactors for insert
  to anon
  with check (true);

create policy "benefactors_select_auth"
  on public.benefactors for select
  to authenticated
  using (true);

create policy "benefactors_update_auth"
  on public.benefactors for update
  to authenticated
  using (true)
  with check (true);

-- documents: anon INSERT, auth SELECT/UPDATE
create policy "documents_insert_anon"
  on public.documents for insert
  to anon
  with check (true);

create policy "documents_select_auth"
  on public.documents for select
  to authenticated
  using (true);

create policy "documents_update_auth"
  on public.documents for update
  to authenticated
  using (true)
  with check (true);
