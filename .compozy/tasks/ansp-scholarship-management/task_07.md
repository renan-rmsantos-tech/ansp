---
status: completed
title: Application review dashboard, detail & decision actions
type: frontend
complexity: high
dependencies:
  - task_04
  - task_05
---

# Task 07: Application review dashboard, detail & decision actions

## Overview

Build the main admin view (`/admin/solicitacoes`) with the stats dashboard showing aggregate counts by status, filterable application card list, expandable detail view showing all application data organized in sections, inline PDF document preview and download, and approve/reject decision actions with discount percentage and reason inputs.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST display stats dashboard with counts of pending, approved, and rejected applications
- MUST implement status filters: Todos / Pendente / Aprovada / Rejeitada
- MUST render application cards showing: family names (pai + mae), status badge, escola, data_envio, number of students, requested discount
- MUST implement expand/collapse on application cards to reveal full detail
- MUST organize expanded detail in sections: applicant details, students table, income & expenses, vehicles, volunteer commitments, benefactors
- MUST provide inline PDF preview (browser-native) and download button for each uploaded document via signed download URLs
- MUST implement approve action: modal/form with discount percentage input (pre-filled with requested discount, editable) and optional reason
- MUST implement reject action: modal/form with optional reason input
- MUST update card status badge and stats dashboard after a decision without full page reload
- MUST display decision information for already-decided applications: status, granted discount, reason, and "Exportar Decisão" button
- MUST follow brand spec: bordered cards, status badges with semantic colors (success/danger/warn), institutional typography
</requirements>

## Subtasks
- [x] 7.1 Build stats dashboard component with aggregate counts from application data
- [x] 7.2 Build status filter controls (Todos/Pendente/Aprovada/Rejeitada)
- [x] 7.3 Build application card component with summary info and expand/collapse
- [x] 7.4 Build expanded application detail view with all data sections
- [x] 7.5 Build document preview and download with signed URL retrieval
- [x] 7.6 Build approve/reject decision action forms with validation and optimistic UI update

## Implementation Details

The Solicitações page fetches applications via `getApplications` Server Action from task_04. Card expansion fetches full detail via `getApplicationDetail`. Document access uses `getDocumentUrl`. Decision actions call `approveApplication` / `rejectApplication`. See TechSpec 'Route Structure' and PRD F3 for component organization.

### Relevant Files
- `design/admin.html` — visual reference for dashboard, cards, detail layout, and decision actions
- `docs/brand-spec.md` — status badge colors and card styling
- `design/design-system.html` — component styling patterns

### Dependent Files
- `app/admin/solicitacoes/page.tsx` — main application list page
- `app/admin/_components/stats-dashboard.tsx` — aggregate status counts
- `app/admin/_components/application-card.tsx` — collapsed card view
- `app/admin/_components/application-detail.tsx` — expanded detail view
- `app/admin/_components/decision-actions.tsx` — approve/reject forms

### Related ADRs
- [ADR-001: Faithful Digital Translation of Existing Paper Workflow](adrs/adr-001.md) — review and decision workflow matches paper committee process

## Deliverables
- Stats dashboard with live counts
- Filterable application card list
- Expandable application detail view with all sections
- Inline document preview and download
- Approve/reject decision forms
- Optimistic UI updates after decisions
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for review and decision flow **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Stats dashboard renders correct counts for pending/approved/rejected
  - [x] Status filter updates the displayed application list
  - [x] Application card renders family names, status badge, escola, date, student count, and discount
  - [x] Application card expand/collapse toggles detail visibility
  - [x] Detail view renders all sections (applicant, students, income, expenses, vehicles, volunteer, benefactors)
  - [x] Approve form pre-fills requested discount and allows editing
  - [x] Approve form validates discount is between 0 and 100
  - [x] Reject form allows empty reason (optional)
  - [x] Decided applications show decision info and export button instead of action buttons
- Integration tests:
  - [x] Loading the page fetches and displays applications from Server Action
  - [x] Filtering by "Pendente" shows only pending applications
  - [x] Approving an application updates status badge and stats without page reload
  - [x] Rejecting an application updates status badge and stats without page reload
  - [x] Document preview opens PDF inline in browser
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Dashboard correctly displays real-time application counts
- Committee member can review full application details and make decisions
- Documents are previewable and downloadable
- UI updates optimistically after decision actions
