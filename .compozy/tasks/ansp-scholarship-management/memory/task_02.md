# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Create complete Supabase schema (9 tables), RLS policies, storage bucket, seed data, and only-one-active trigger.

## Important Decisions

- Used unique partial index + trigger for only-one-active school year: partial index prevents two active rows on INSERT, trigger deactivates others on UPDATE.
- Storage bucket configured in config.toml (Supabase local dev creates it automatically), with RLS policies in a separate migration for upload/download control.
- MIME types allowed: image/png, image/jpeg, image/webp, image/gif, image/bmp, image/tiff, application/pdf. Size limit: 10MB.
- Seed uses `on conflict do nothing` for idempotency.
- Tests are structural (SQL file parsing) since no live Supabase instance is available in CI. Integration tests against a real local Supabase instance should be added if `supabase start` is available in CI.

## Learnings

- `storage.foldername(name)` returns an array of folder segments — `[1]` gets the first folder for path-based access control.
- Supabase config.toml `[storage.buckets.X]` creates the bucket automatically during `supabase start`.

## Files / Surfaces

- `supabase/config.toml` — modified to add documents bucket config
- `supabase/migrations/20260616000001_create_tables.sql` — 9 tables
- `supabase/migrations/20260616000002_rls_policies.sql` — RLS policies
- `supabase/migrations/20260616000003_storage_policies.sql` — storage policies
- `supabase/migrations/20260616000004_school_year_active_trigger.sql` — active trigger
- `supabase/seed.sql` — default templates + sample school year
- `__tests__/supabase-schema.test.ts` — 34 tests

## Errors / Corrections

- Initial regex in test for partial index was too broad — fixed to match exact SQL syntax.

## Ready for Next Run
