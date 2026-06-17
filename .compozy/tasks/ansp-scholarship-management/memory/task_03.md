# Task Memory: task_03.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Auth middleware + login/logout + 3 public form Server Actions + Zod schema + CPF validation.

## Important Decisions

- Root `middleware.ts` creates its own Supabase client inline (doesn't use `lib/supabase/middleware.ts` updateSession) to keep the auth check self-contained and testable. The `lib/supabase/middleware.ts` remains as a utility for future use.
- `submitApplication` does NOT use a Postgres transaction (Supabase JS client doesn't support `BEGIN/COMMIT`). Inserts are done sequentially: application → students → parallel (other_children, vehicles, collaboration, benefactors, documents). A partial failure leaves orphaned records but the application ID is returned only on full success.
- CPF validation is pure — no external library. Validates both format and check digits.
- `createSignedUploadUrl` uses `crypto.randomUUID()` for path scoping, sanitizes filenames by replacing non-alphanumeric chars with underscores.
- File move from `pending/` to `applications/{id}/` happens after all inserts succeed.

## Learnings

- RTK proxy intercepts vitest output including coverage tables — use `./node_modules/.bin/vitest` directly for readable coverage output.
- Mocking `crypto` module in vitest requires `importActual` spread to preserve default export; simpler to test UUID paths with regex patterns instead.
- `"use server"` directive in Server Actions works fine in vitest test environment when the module is imported directly.

## Files / Surfaces

- `middleware.ts` (root) — NEW, auth guard for /admin/*
- `lib/validations/cpf.ts` — NEW, CPF validation
- `lib/validations/application-schema.ts` — NEW, Zod schema
- `app/login/_actions/auth-actions.ts` — NEW, login/logout
- `app/(form)/_actions/form-actions.ts` — NEW, 3 Server Actions
- `vitest.config.ts` — MODIFIED, added text reporter + root middleware to coverage include
- `__tests__/cpf.test.ts` — NEW
- `__tests__/application-schema.test.ts` — NEW
- `__tests__/form-actions.test.ts` — NEW
- `__tests__/middleware.test.ts` — NEW
- `__tests__/auth-actions.test.ts` — NEW
- `__tests__/submit-application.test.ts` — NEW

## Errors / Corrections

- Initial crypto mock failed because `vi.mock("crypto", () => ({...}))` doesn't preserve the default export. Fixed by using regex-based assertions instead.

## Ready for Next Run

Task complete. All deliverables verified.
