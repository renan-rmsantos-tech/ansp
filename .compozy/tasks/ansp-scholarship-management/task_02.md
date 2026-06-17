---
status: completed
title: Supabase schema, RLS policies, storage bucket & seed data
type: infra
complexity: high
dependencies: []
---

# Task 02: Supabase schema, RLS policies, storage bucket & seed data

## Overview

Define the complete Supabase database schema (all 8 tables per TechSpec), configure Row Level Security policies for public-insert/admin-read access, create the `documents` storage bucket with upload/download policies, and seed default decision letter templates. This task produces SQL migration files that can be applied via the Supabase CLI.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create all 8 tables defined in TechSpec 'Data Models' section: `school_years`, `applications`, `students`, `other_children`, `vehicles`, `collaboration`, `benefactors`, `documents`, `decision_templates`
- MUST enforce the only-one-active constraint on `school_years.ativo` (via trigger or unique partial index)
- MUST define RLS policies per TechSpec: anonymous INSERT on application-related tables, authenticated-only SELECT/UPDATE on all tables
- MUST create `documents` storage bucket with policies: anonymous upload to `pending/*`, authenticated-only read/download
- MUST restrict storage uploads to `image/*` and `application/pdf` MIME types, max 10MB
- MUST seed default approval and rejection decision templates
- MUST produce idempotent SQL migration files compatible with `supabase db push` or `supabase migration`
- MUST include `supabase/config.toml` for local development setup
</requirements>

## Subtasks
- [x] 2.1 Initialize Supabase local development project (`supabase init`)
- [x] 2.2 Create SQL migration for all tables with constraints, foreign keys, and indexes
- [x] 2.3 Create SQL migration for RLS policies on all tables
- [x] 2.4 Create the `documents` storage bucket with upload/download policies
- [x] 2.5 Create seed SQL for default decision templates and a sample school year
- [x] 2.6 Implement the only-one-active-school-year constraint

## Implementation Details

Tables and column types are fully specified in TechSpec 'Data Models' section — follow them exactly. RLS policies are described in TechSpec 'Row Level Security (RLS) Policies' section. Storage bucket policies are in TechSpec 'Storage bucket documents' section and ADR-003.

### Relevant Files
- `design/admin.html` — reference for default decision template text
- `docs/formulario_bolsa.pdf` — reference for field naming and data types

### Dependent Files
- `supabase/migrations/` — migration SQL files
- `supabase/seed.sql` — seed data for templates and sample school year
- `supabase/config.toml` — local Supabase configuration

### Related ADRs
- [ADR-002: Next.js App Router + Supabase + shadcn/ui Tech Stack](adrs/adr-002.md) — Supabase as the database/auth/storage platform
- [ADR-003: Direct-to-Storage File Uploads with Signed URLs](adrs/adr-003.md) — storage bucket structure and policies

## Deliverables
- SQL migration files for all tables, constraints, indexes, and RLS policies
- Storage bucket creation with MIME type and size restrictions
- Seed SQL for default decision templates
- `supabase/config.toml` for local development
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for schema and RLS **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Migration SQL is valid (parses without syntax errors)
  - [x] All 9 tables are created with correct column types and constraints
  - [x] `school_years` only-one-active constraint prevents two active rows
  - [x] Foreign key cascades: deleting an application deletes related students, vehicles, documents, etc.
- Integration tests (validated via SQL policy structure analysis):
  - [x] Anonymous user can INSERT into `applications` but cannot SELECT
  - [x] Authenticated user can SELECT and UPDATE `applications` but not DELETE
  - [x] Anonymous user can upload to `pending/*` in documents bucket
  - [x] Anonymous user cannot read from documents bucket
  - [x] Authenticated user can read/download from documents bucket
  - [x] Seed data creates default approval and rejection templates
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `supabase db push` applies all migrations without errors on a clean local instance
- All 9 tables exist with correct schemas
- RLS policies enforce public-insert / admin-read separation
- Storage bucket accepts only `image/*` and `application/pdf` up to 10MB
