---
status: completed
title: Project scaffolding, Tailwind brand theme & Supabase client
type: infra
complexity: medium
dependencies: []
---

# Task 01: Project scaffolding, Tailwind brand theme & Supabase client

## Overview

Initialize the Next.js 15 App Router project with TypeScript and Tailwind CSS, configure the Tailwind theme to match the ANSP brand spec (OKLch tokens, serif display font stack, system sans body), install shadcn/ui, and set up the Supabase client utilities using `@supabase/ssr` for cookie-based auth in both server and client contexts.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST use Next.js 15 with App Router (not Pages Router)
- MUST configure TypeScript strict mode
- MUST map all CSS custom properties from `docs/brand-spec.md` to Tailwind theme tokens (colors, fonts, radii)
- MUST use OKLch color space for all brand colors
- MUST configure serif display font stack (`Iowan Old Style`, `Charter`, `Palatino`, `Georgia`, serif) and system sans body stack — no external font loading
- MUST install and initialize shadcn/ui with the brand theme
- MUST create Supabase client utilities for Server Components, Server Actions, Client Components, and Middleware using `@supabase/ssr`
- MUST create `.env.example` with all required Supabase environment variables
- MUST configure `globals.css` with Tailwind base + brand custom properties
</requirements>

## Subtasks
- [x] 1.1 Initialize Next.js 15 project with TypeScript, Tailwind CSS, and App Router
- [x] 1.2 Map brand spec tokens to Tailwind config (colors, fonts, border-radius, spacing)
- [x] 1.3 Configure `globals.css` with CSS custom properties and Tailwind directives
- [x] 1.4 Install and configure shadcn/ui with ANSP brand theme customization
- [x] 1.5 Install `@supabase/ssr` and `@supabase/supabase-js`, create client utility files for server/client/middleware contexts
- [x] 1.6 Create `.env.example` with Supabase environment variable placeholders

## Implementation Details

Create the project root structure per TechSpec 'Route Structure' section. The Tailwind config must define custom theme extensions for the brand palette. Supabase client utilities follow `@supabase/ssr` patterns for Next.js App Router — see TechSpec 'Integration Points' section.

### Relevant Files
- `docs/brand-spec.md` — canonical source of all design tokens
- `design/design-system.html` — reference for token values and component styling
- `design/login.html` — reference for `:root` CSS custom properties
- `design/formulario.html` — reference for `:root` CSS custom properties

### Dependent Files
- `app/layout.tsx` — root layout will use the configured fonts and global styles
- `app/globals.css` — Tailwind directives and brand tokens
- `tailwind.config.ts` — brand theme extension
- `lib/supabase/server.ts` — server-side Supabase client
- `lib/supabase/client.ts` — browser-side Supabase client
- `lib/supabase/middleware.ts` — middleware Supabase client

### Related ADRs
- [ADR-002: Next.js App Router + Supabase + shadcn/ui Tech Stack](adrs/adr-002.md) — defines the tech stack and Tailwind/shadcn approach

## Deliverables
- Initialized Next.js 15 project with TypeScript and Tailwind CSS
- Tailwind config with all brand tokens mapped
- `globals.css` with CSS custom properties and Tailwind base
- shadcn/ui initialized and themed
- Supabase client utility files for server, client, and middleware
- `.env.example` with documented placeholders
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for Supabase client initialization **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Tailwind config exports correct brand color values
  - [ ] Supabase server client creates successfully with mock env vars
  - [ ] Supabase browser client creates successfully with mock env vars
  - [ ] `.env.example` contains all required Supabase variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Integration tests:
  - [ ] Next.js project builds without errors (`next build` exits 0)
  - [ ] Root layout renders with correct font families applied
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `next build` completes without errors
- Brand tokens in Tailwind config match `docs/brand-spec.md` exactly
- Supabase clients are importable and functional with valid env vars
