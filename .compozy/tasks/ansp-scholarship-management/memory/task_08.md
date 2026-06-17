# Task Memory: task_08.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Build /admin/ano-letivo (school year CRUD) and /admin/textos (decision template editor with live preview). Export button already existed in application-card.tsx from task 07.

## Important Decisions

- Lifted school year state to AnoLetivoClient (client.tsx) rather than managing it inside SchoolYearList — enables form→list communication without refs.
- Template editor uses controlled state per tab, switching tabs preserves edits.
- TemplatePreview imports replaceTokens directly from lib/templates/token-replacer.ts for live preview.
- Used font-mono for template textarea fields so tokens are visually distinct.
- Confirmation dialogs are inline overlays (fixed positioning), not shadcn Dialog — keeps the component self-contained with no extra shadcn dependency.

## Learnings

- Export button (subtask 8.7) was already fully implemented in application-card.tsx during task 07 — no work needed.
- Date inputs need "T12:00:00" suffix for toLocaleDateString to avoid timezone offset issues.
- Pre-existing tsc errors (27 total in 4 files from prior tasks) — none in task 08 files.

## Files / Surfaces

- Created: `app/admin/_components/school-year-list.tsx`, `school-year-form.tsx`, `template-editor.tsx`, `template-preview.tsx`
- Created: `app/admin/ano-letivo/client.tsx`
- Modified: `app/admin/ano-letivo/page.tsx`, `app/admin/textos/page.tsx`
- Tests: `__tests__/school-year.test.tsx`, `__tests__/template-editor.test.tsx`, `__tests__/export-decision.test.tsx`

## Errors / Corrections

None.

## Ready for Next Run

Task 08 is the final task in the task list. All 8 tasks complete.
