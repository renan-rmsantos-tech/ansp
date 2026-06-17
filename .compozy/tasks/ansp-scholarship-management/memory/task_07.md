# Task Memory: task_07.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Build /admin/solicitacoes with stats dashboard, filterable card list, expandable detail view, document preview/download, and approve/reject decision actions.

## Important Decisions

- Split page into server component (`page.tsx` fetches data) + client component (`client.tsx` manages state/filters/optimistic updates)
- Created separate `document-preview.tsx` component for inline PDF preview via signed URLs
- Optimistic UI: `onDecision` callback updates client-side state immediately; rolls back on server error
- Export decision uses Blob + createElement("a") pattern for download

## Learnings

- `vi.hoisted()` required when mock factory references top-level `vi.fn()` variables (vitest hoisting)
- jsdom doesn't implement `createElement("a").click()` for downloads — test verifies server action call, not DOM download behavior
- Coverage at 84.6% lines (target >=80%)

## Files / Surfaces

- `app/admin/solicitacoes/page.tsx` — server component, fetches applications
- `app/admin/solicitacoes/client.tsx` — client orchestrator (stats, filters, card list, decisions)
- `app/admin/_components/stats-dashboard.tsx` — aggregate status counts + computeStats helper
- `app/admin/_components/application-card.tsx` — collapsed card with expand/collapse, export, decision info
- `app/admin/_components/application-detail.tsx` — expanded detail with all sections
- `app/admin/_components/document-preview.tsx` — inline PDF preview + download via signed URLs
- `app/admin/_components/decision-actions.tsx` — approve/reject forms with validation
- `__tests__/stats-dashboard.test.tsx` — 4 tests
- `__tests__/solicitacoes-client.test.tsx` — 19 tests

## Errors / Corrections

- Initial mock pattern used top-level `vi.fn()` referenced inside `vi.mock()` factory → fixed with `vi.hoisted()`

## Ready for Next Run

Task_08 can proceed — it depends on task_04 and task_05 (both complete), plus task_07 provides the pattern for export button wiring.
