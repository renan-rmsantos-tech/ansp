# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State

All 8 tasks complete. Next.js 16 + Tailwind v4 + shadcn/ui + Supabase client utils + full DB schema + auth middleware + public form Server Actions + Zod validation + all admin Server Actions + token replacer + login page + admin shell layout (topbar/sidebar) + complete 6-step public scholarship form + admin review dashboard with filterable card list, expandable detail view, document preview/download, approve/reject decision actions with optimistic UI + school year management (CRUD, active toggle) + decision template editor (tabs, live preview) + decision export button.

## Shared Decisions

- **Tailwind v4 CSS-based config**: Brand tokens live in `app/globals.css` `@theme` block, not a `tailwind.config.ts` file. Future tasks adding Tailwind tokens must edit `globals.css`.
- **shadcn CSS var mapping**: shadcn variables (--primary, --background, etc.) are mapped to brand OKLch values in `:root` block of globals.css. New shadcn components will inherit the brand palette automatically.
- **No external fonts**: Brand spec forbids external font loading. Layout uses system font stacks only.
- **ESLint flat config**: `eslint.config.mjs` uses `eslint-config-next/core-web-vitals` native flat config export. Do not use FlatCompat.
- **design/ ignored in ESLint**: Legacy HTML prototypes in `design/` are excluded from linting.

## Shared Learnings

- `next@16.2.9` installed (latest). App Router, Server Actions, RSC all work as specified in techspec.
- shadcn init overwrites globals.css and layout.tsx — always reapply brand customizations after adding shadcn components.
- Vitest configured with `@vitejs/plugin-react` and jsdom environment. Path alias `@/*` resolved via vitest.config.ts.
- `submitApplication` inserts sequentially without DB transactions (Supabase JS client limitation). Acceptable for MVP; partial failures leave orphaned child rows.
- RTK proxy intercepts vitest output — use `./node_modules/.bin/vitest` directly for readable coverage tables. Use `RTK_DISABLE=1` prefix for tsc/lint exit code accuracy.
- `@testing-library/react` needs explicit `afterEach(cleanup)` in vitest/jsdom — auto-cleanup doesn't work.
- `base1.png` is in `public/` for seal logo SVG `<image>` element.
- Root `middleware.ts` handles auth guard; `lib/supabase/middleware.ts` is the reusable session-refresh utility from Supabase docs.

## Open Risks

## Handoffs

- All tasks complete. No remaining work items.
- Admin pages follow server/client split: page.tsx is RSC, client.tsx manages client state.
- Public form components live in `app/(form)/_components/`. Form types and helpers in `form-types.ts`.
- Admin Server Actions live in `app/admin/_actions/admin-actions.ts`. Token replacer in `lib/templates/token-replacer.ts`.
- `requireAuth()` throws on unauthenticated requests — callers must handle the thrown error.
- DB trigger handles only-one-active school year deactivation — application code just sets `ativo = true/false`.
- Supabase schema uses `supabase/migrations/` — run `supabase db push` or `supabase db reset` to apply.
- Storage bucket `documents` is configured in config.toml, auto-created by `supabase start`.
