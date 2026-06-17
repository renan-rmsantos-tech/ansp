---
status: completed
title: School year management, decision templates & export UI
type: frontend
complexity: medium
dependencies:
  - task_04
  - task_05
---

# Task 08: School year management, decision templates & export UI

## Overview

Build the school year management page (`/admin/ano-letivo`) with CRUD operations and active toggle, the decision template editor page (`/admin/textos`) with tabbed editing and live preview, and the decision letter export button on decided applications that triggers a .txt file download.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement school year list showing name, start date, end date, and active status badge
- MUST implement create school year form with name, start date, and end date inputs with validation (end > start)
- MUST implement activate/deactivate toggle — only one active at a time, with confirmation before deactivation
- MUST implement delete school year with confirmation dialog
- MUST implement decision template editor with two tabs: Aprovação and Rejeição
- MUST display each template with three editable sections: cabeçalho, corpo, rodapé
- MUST show available token reference above the editor ({nome_pai}, {nome_mae}, {escola}, {aluno}, {desconto}, {data}, {motivo}, {ano_letivo})
- MUST implement live preview panel rendering the template with sample data
- MUST persist template changes via `saveTemplate` Server Action
- MUST implement "Exportar Decisão" button on decided applications (in task_07's cards) that calls `exportDecision` and triggers browser download of .txt file
- MUST follow brand spec styling throughout
</requirements>

## Subtasks
- [x] 8.1 Build school year list page with status badges and action buttons
- [x] 8.2 Build create school year form with date validation
- [x] 8.3 Implement activate/deactivate toggle and delete with confirmation dialogs
- [x] 8.4 Build template editor page with Aprovação/Rejeição tabs
- [x] 8.5 Build template editing fields (cabeçalho, corpo, rodapé) with token reference
- [x] 8.6 Build live preview panel with sample data token replacement
- [x] 8.7 Implement decision export button and .txt file download trigger

## Implementation Details

School year management uses Server Actions from task_04 (`getSchoolYears`, `createSchoolYear`, `toggleSchoolYear`, `deleteSchoolYear`). Template editor uses `getTemplates` and `saveTemplate`. Export uses `exportDecision`. The export button lives on application cards in the Solicitações view (task_07) but is implemented in this task. See TechSpec 'Route Structure' for file paths.

### Relevant Files
- `design/admin.html` — visual reference for school year list and template editor
- `docs/brand-spec.md` — design tokens for consistent styling

### Dependent Files
- `app/admin/ano-letivo/page.tsx` — school year management page
- `app/admin/textos/page.tsx` — decision template editor page
- `app/admin/_components/school-year-form.tsx` — create school year form
- `app/admin/_components/school-year-list.tsx` — school year list with actions
- `app/admin/_components/template-editor.tsx` — template editing with tabs
- `app/admin/_components/template-preview.tsx` — live preview with token replacement

### Related ADRs
- [ADR-001: Faithful Digital Translation of Existing Paper Workflow](adrs/adr-001.md) — school year management and template customization per the paper workflow

## Deliverables
- School year management page with full CRUD
- Decision template editor with tabs and live preview
- Decision export download functionality
- Confirmation dialogs for destructive actions
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for school year and template management **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] School year list renders all years with correct status badges
  - [ ] Create form validates that end date is after start date
  - [ ] Create form rejects empty name
  - [ ] Activate toggle shows confirmation before deactivating current active year
  - [ ] Delete button shows confirmation dialog before deletion
  - [ ] Template editor renders two tabs (Aprovação/Rejeição)
  - [ ] Template editor displays all three sections (cabeçalho, corpo, rodapé) per template
  - [ ] Token reference displays all 8 available tokens
  - [ ] Live preview replaces tokens with sample data correctly
  - [ ] Export button triggers file download with correct filename
- Integration tests:
  - [ ] Creating a school year adds it to the list
  - [ ] Activating a year deactivates the previously active year
  - [ ] Deleting a year removes it from the list
  - [ ] Saving a template persists changes and re-renders preview
  - [ ] Export generates a .txt file with correct token-replaced content
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Committee can manage school years (create, activate, deactivate, delete)
- Only one school year can be active at a time
- Committee can customize decision letter templates with live preview
- Decision letters export as .txt with all tokens correctly replaced
