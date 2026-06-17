---
status: completed
title: Auth middleware & public form Server Actions
type: backend
complexity: high
dependencies:
  - task_01
  - task_02
---

# Task 03: Auth middleware & public form Server Actions

## Overview

Implement the Next.js middleware that protects `/admin/*` routes by checking Supabase Auth sessions (redirecting unauthenticated users to `/login`), the Supabase Auth login/logout Server Actions, and the three public form Server Actions: `getActiveSchoolYear()`, `createSignedUploadUrl()`, and `submitApplication()` with full Zod validation and multi-table transactional insert.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement Next.js middleware that checks Supabase Auth session on `/admin/*` routes and redirects to `/login` if unauthenticated
- MUST implement `login(email, password)` Server Action using Supabase Auth `signInWithPassword`
- MUST implement `logout()` Server Action using Supabase Auth `signOut`
- MUST implement `getActiveSchoolYear()` — returns `{ open: boolean; year?: SchoolYear }` based on active school year's date range
- MUST implement `createSignedUploadUrl(filename, category)` — generates a time-limited (5min) signed upload URL for Supabase Storage `pending/{uuid}/*` path
- MUST implement `submitApplication(data)` — validates full `ApplicationSubmission` with Zod, inserts application + students + other_children + vehicles + collaboration + benefactors + documents in a single transaction, moves files from `pending/` to `applications/{id}/`
- MUST validate CPF format and check digits using a tested validation function
- MUST return structured error responses with Zod validation errors for form display
- MUST handle Supabase errors gracefully with user-friendly messages
</requirements>

## Subtasks
- [x] 3.1 Create Next.js middleware for `/admin/*` route protection with Supabase session check
- [x] 3.2 Implement login and logout Server Actions with Supabase Auth
- [x] 3.3 Define the `ApplicationSubmission` Zod schema with all fields, nested arrays, CPF validation, and numeric constraints
- [x] 3.4 Implement `getActiveSchoolYear()` Server Action
- [x] 3.5 Implement `createSignedUploadUrl()` Server Action with path scoping and expiry
- [x] 3.6 Implement `submitApplication()` Server Action with Zod validation and multi-table insert

## Implementation Details

Server Actions are defined in `app/(form)/_actions/form-actions.ts` for public form actions and `app/login/_actions/auth-actions.ts` for auth. Middleware goes in `middleware.ts` at project root. The Zod schema for `ApplicationSubmission` must match the TechSpec 'Core Interfaces' section. See TechSpec 'Server Actions — Public Form' table for signatures.

### Relevant Files
- `design/formulario.html` — form field names and validation rules
- `design/login.html` — auth flow reference
- `docs/formulario_bolsa.pdf` — field requirements from the paper form

### Dependent Files
- `middleware.ts` — route protection middleware
- `app/(form)/_actions/form-actions.ts` — public form Server Actions
- `app/login/_actions/auth-actions.ts` — login/logout Server Actions
- `lib/validations/application-schema.ts` — Zod schema for ApplicationSubmission
- `lib/validations/cpf.ts` — CPF validation utility

### Related ADRs
- [ADR-003: Direct-to-Storage File Uploads with Signed URLs](adrs/adr-003.md) — signed URL generation pattern and path structure

## Deliverables
- Next.js middleware protecting admin routes
- Login/logout Server Actions
- Three public form Server Actions (`getActiveSchoolYear`, `createSignedUploadUrl`, `submitApplication`)
- `ApplicationSubmission` Zod schema
- CPF validation utility
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for auth flow and form submission **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Zod schema accepts valid complete application data
  - [x] Zod schema rejects missing required fields (pai_nome, pai_cpf, etc.)
  - [x] Zod schema rejects invalid CPF (wrong check digits)
  - [x] Zod schema rejects negative income and expense values
  - [x] Zod schema rejects empty student array
  - [x] Zod schema rejects desconto_solicitado outside 0-100 range
  - [x] CPF validation correctly validates real CPF numbers
  - [x] CPF validation rejects known-invalid sequences (all same digit)
  - [x] `getActiveSchoolYear` returns `{ open: false }` when no active school year exists
  - [x] `getActiveSchoolYear` returns `{ open: false }` when active year's dates are outside current date
  - [x] `createSignedUploadUrl` generates a URL with correct path prefix `pending/{uuid}/`
- Integration tests:
  - [x] Middleware redirects unauthenticated requests to `/admin/solicitacoes` → `/login`
  - [x] Middleware allows authenticated requests to `/admin/solicitacoes`
  - [x] Login action with valid credentials returns session
  - [x] Login action with invalid credentials returns error
  - [x] `submitApplication` with valid data creates records in all related tables
  - [x] `submitApplication` with invalid data returns Zod errors without inserting any records
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Unauthenticated users cannot access any `/admin/*` route
- Valid application submission creates consistent records across all tables
- Invalid application data returns structured Zod errors without side effects
