# Task Memory: task_04.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Implement all admin-facing Server Actions: application CRUD, decisions, school years, templates, document URLs, decision export.

## Important Decisions

- `requireAuth()` helper throws on unauthenticated requests rather than returning error objects — keeps action bodies clean, tests verify via `rejects.toThrow`.
- `exportDecision` joins cabecalho + corpo + rodape with double newline before token replacement — matches the conceptual structure of the decision letter.
- `saveTemplate` does upsert by checking existing template of same tipo — only one template per tipo expected (aprovacao/rejeicao).
- Token replacer is a standalone utility in `lib/templates/token-replacer.ts` — pure function, no Supabase dependency, easy to test.
- DB trigger `trg_enforce_single_active_school_year` handles only-one-active deactivation — `toggleSchoolYear` just flips the boolean and the trigger does the rest.

## Learnings

- Supabase JS `select("*, students(*)")` works for nested joins on foreign key relationships.
- `createSignedUrl(path, seconds)` generates download URLs; `createSignedUploadUrl` is for uploads.
- Mock chaining in Vitest requires careful `mockImplementation` per-call-count for actions that call `from()` multiple times.

## Files / Surfaces

- `app/admin/_actions/admin-actions.ts` — all 12 admin Server Actions
- `lib/templates/token-replacer.ts` — token replacement utility
- `__tests__/admin-actions.test.ts` — 17 tests covering auth guard, CRUD, decisions, export
- `__tests__/token-replacer.test.ts` — 8 tests covering all tokens, edge cases

## Errors / Corrections

None.

## Ready for Next Run

Task complete. All tests pass, coverage >= 80%.
