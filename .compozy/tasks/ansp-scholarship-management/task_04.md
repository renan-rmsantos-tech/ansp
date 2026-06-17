---
status: completed
title: Admin Server Actions (applications, decisions, school years, templates, export)
type: backend
complexity: high
dependencies:
  - task_01
  - task_02
---

# Task 04: Admin Server Actions (applications, decisions, school years, templates, export)

## Overview

Implement all admin-facing Server Actions: application listing and detail retrieval, approve/reject decision actions, school year CRUD with only-one-active enforcement, decision template CRUD, document URL generation, and decision letter export with token replacement. These actions power all three admin views (Solicitações, Ano Letivo, Textos).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement `getApplications(filter?)` — fetches applications with nested students, filterable by status ('pendente', 'aprovada', 'rejeitada', or all)
- MUST implement `getApplicationDetail(id)` — fetches full application with all related records (students, other_children, vehicles, collaboration, benefactors, documents)
- MUST implement `getDocumentUrl(path)` — generates signed download URL for admin document access
- MUST implement `approveApplication(id, desconto, motivo?)` — sets status='aprovada', stores `desconto_concedido`, optional `motivo`, `data_decisao`, and `decided_by`
- MUST implement `rejectApplication(id, motivo?)` — sets status='rejeitada', stores optional `motivo`, `data_decisao`, and `decided_by`
- MUST implement `getSchoolYears()`, `createSchoolYear(data)`, `toggleSchoolYear(id)`, `deleteSchoolYear(id)` with only-one-active enforcement
- MUST implement `getTemplates()` and `saveTemplate(data)` for decision letter template CRUD
- MUST implement `exportDecision(id)` — reads application data + active template, replaces tokens ({nome_pai}, {nome_mae}, {escola}, {aluno}, {desconto}, {data}, {motivo}, {ano_letivo}), returns `.txt` content and filename
- MUST verify authenticated session in every admin Server Action
- MUST return structured error responses for all failure cases
</requirements>

## Subtasks
- [x] 4.1 Implement application listing with status filter and nested student data
- [x] 4.2 Implement application detail retrieval with all related records
- [x] 4.3 Implement approve and reject decision actions with validation
- [x] 4.4 Implement school year CRUD with only-one-active toggle logic
- [x] 4.5 Implement decision template get/save actions
- [x] 4.6 Implement decision letter export with token replacement engine
- [x] 4.7 Implement document signed download URL generation

## Implementation Details

All admin Server Actions go in `app/admin/_actions/admin-actions.ts`. Each action must check for an authenticated Supabase session before executing. Token replacement for decision export follows the token list in PRD F4. See TechSpec 'Server Actions — Admin' table for full signatures and return types.

### Relevant Files
- `design/admin.html` — reference for admin data display and decision flow
- `design/formulario.html` — reference for data structure matching form fields

### Dependent Files
- `app/admin/_actions/admin-actions.ts` — all admin Server Actions
- `lib/templates/token-replacer.ts` — token replacement utility for decision export

### Related ADRs
- [ADR-001: Faithful Digital Translation of Existing Paper Workflow](adrs/adr-001.md) — decision workflow matches paper process
- [ADR-003: Direct-to-Storage File Uploads with Signed URLs](adrs/adr-003.md) — signed download URL pattern for document access

## Deliverables
- All admin Server Actions per TechSpec specification
- Token replacement utility for decision letter generation
- Auth guard on every admin action
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for decision flow and school year management **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Token replacer replaces all 8 tokens ({nome_pai}, {nome_mae}, {escola}, {aluno}, {desconto}, {data}, {motivo}, {ano_letivo}) correctly
  - [x] Token replacer handles missing optional fields ({motivo} when empty)
  - [x] Token replacer handles multiple students (comma-separated {aluno})
  - [x] `approveApplication` rejects desconto_concedido outside 0-100 range
  - [x] `createSchoolYear` rejects end date before start date
- Integration tests:
  - [x] `getApplications` returns applications filtered by status
  - [x] `getApplicationDetail` returns all nested records for an application
  - [x] `approveApplication` updates status, discount, reason, timestamp, and decided_by
  - [x] `rejectApplication` updates status, reason, timestamp, and decided_by
  - [x] `toggleSchoolYear` deactivates previously active year when activating a new one
  - [x] `deleteSchoolYear` removes the record
  - [x] `saveTemplate` persists updated template and `getTemplates` returns it
  - [x] `exportDecision` returns correct .txt content with all tokens replaced
  - [x] All admin actions reject unauthenticated requests
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- All admin Server Actions are auth-guarded
- Decision export correctly replaces all tokens with application data
- School year toggle guarantees only one active year at any time
