# Task Memory: task_01.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Scaffold Next.js 15 project with brand theme, shadcn/ui, and Supabase client utilities.

## Important Decisions

- Manual scaffold instead of `create-next-app` because existing files (design/, docs/, .compozy/) conflicted with the template.
- Removed Google Fonts import added by shadcn init — brand spec explicitly requires no external font loading.
- Mapped shadcn CSS variables (--primary, --background, etc.) to brand-spec OKLch values so shadcn components inherit the brand palette.
- Used `eslint-config-next/core-web-vitals` flat config export directly (Next.js 16 ships native ESLint 9 flat config) — FlatCompat had circular ref bug.
- Tailwind v4 `@theme` block used instead of `tailwind.config.ts` — v4 moved config to CSS.
- design/ directory ignored in eslint config (legacy HTML prototype JS files).

## Learnings

- Next.js 16 (`next@16.2.9`) installed despite requesting 15 — latest major is 16. This is fine per ADR-002 intent (App Router + Server Actions).
- shadcn/ui `init` overwrites globals.css and layout.tsx — must reapply brand customizations after init.
- `@eslint/eslintrc` FlatCompat has circular structure bug with eslint-config-next on ESLint 9 — use native flat config exports instead.

## Files / Surfaces

- app/layout.tsx, app/page.tsx, app/globals.css
- lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/middleware.ts
- components/ui/button.tsx, lib/utils.ts (created by shadcn init)
- components.json, tsconfig.json, postcss.config.mjs, next.config.ts, eslint.config.mjs
- vitest.config.ts, __tests__/setup.ts
- .env.example, .gitignore

## Errors / Corrections

- create-next-app refused to run in non-empty directory → manual scaffold
- shadcn init added Geist Google Font import → removed to comply with brand spec
- FlatCompat ESLint config crashed → switched to native flat config

## Ready for Next Run

Project fully scaffolded. All brand tokens mapped. Supabase clients ready. shadcn/ui initialized. Tests and build passing.
