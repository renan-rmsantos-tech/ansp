# Task Memory: task_05.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Login page + admin shell layout (topbar, sidebar, responsive hamburger).

## Important Decisions

- SVG seal uses unique IDs per instance (`seal-${size}`) to avoid id collisions when multiple seals render on same page (login vs topbar).
- `base1.png` copied to `public/` so seal logo can reference `/base1.png` from Next.js static serving.
- Mobile sidebar uses fixed-position overlay + hamburger FAB (bottom-right), not a horizontal nav bar — provides better UX on small screens than the prototype's horizontal scroll approach.
- Login form uses `useTransition` for pending state rather than `useActionState` — simpler for the error-return-only pattern where success triggers a server-side redirect.
- Placeholder pages created for `/admin/solicitacoes`, `/admin/ano-letivo`, `/admin/textos` — tasks 07/08 will replace these.

## Learnings

- RTK proxy intercepts `tsc` and `next lint` exit codes (reports exit 1 even on success) — check output text, not exit code, when RTK is active. Use `RTK_DISABLE=1` prefix for clean verification.
- `@testing-library/react` cleanup between tests needed explicit `afterEach(cleanup)` — jsdom environment with vitest doesn't auto-cleanup.

## Files / Surfaces

- `components/ui/seal-logo.tsx` — new, reusable SVG seal
- `app/login/page.tsx` — new, login form (client component)
- `app/admin/layout.tsx` — new, admin shell layout (server component)
- `app/admin/page.tsx` — new, redirect to solicitacoes
- `app/admin/_components/topbar.tsx` — new, topbar with logout
- `app/admin/_components/sidebar.tsx` — new, sidebar with nav + responsive
- `app/admin/solicitacoes/page.tsx` — new, placeholder
- `app/admin/ano-letivo/page.tsx` — new, placeholder
- `app/admin/textos/page.tsx` — new, placeholder
- `public/base1.png` — new, copied from design/
- `__tests__/login-page.test.tsx` — new, 7 tests
- `__tests__/sidebar.test.tsx` — new, 6 tests
- `__tests__/topbar.test.tsx` — new, 3 tests

## Errors / Corrections

- Initial test run had duplicate DOM elements (no cleanup) — fixed with explicit `afterEach(cleanup)`.

## Ready for Next Run

Tasks 07/08 will build on the admin layout — replace placeholder pages with real content.
