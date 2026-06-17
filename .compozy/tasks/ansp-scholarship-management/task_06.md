---
status: completed
title: Public multi-step scholarship form
type: frontend
complexity: critical
dependencies:
  - task_03
---

# Task 06: Public multi-step scholarship form

## Overview

Build the complete 6-step public scholarship application form (F1) including the form shell with sticky progress bar, enrollment window check, all six form steps with dynamic fields and auto-calculations, drag-and-drop file upload with signed URL flow, review/summary step with legal declaration, full submission, and success confirmation screen. This is the primary public-facing interface of the system.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST check enrollment window via `getActiveSchoolYear()` — show "closed" message when no active school year or outside date range
- MUST implement sticky progress bar showing current step, completed steps, and remaining steps per `design/formulario.html`
- MUST implement Step 1 (Applicant Data): parent names, CPF, RG, profession, address, phone, email, document uploads (RG parents, marriage cert, address proof), other children list (dynamic add/remove)
- MUST implement Step 2 (Student Data): dynamic student list (add/remove) with name, CPF, grade (Maternal–3º EM), tuition amount, document uploads (RG, birth cert). Auto-calculate total tuition and apply requested discount percentage
- MUST implement Step 3 (Family Income): father/mother/other income fields, auto-sum total, number of people in household, income tax statement upload
- MUST implement Step 4 (Monthly Expenses): rent, utilities, TV, cell plan, cell installments, internet fields, auto-sum total, bank statement uploads (last 3 months)
- MUST implement Step 5 (Vehicles & Volunteer): dynamic vehicle list (brand, model, year), volunteer checkboxes (limpeza with vezes_semana, mutirão with sabados, arrecadação, benfeitores, outros), benefactor list (10 nome+email)
- MUST implement Step 6 (Review & Submit): read-only summary of all data, legal declaration checkbox, submit button
- MUST implement file upload component with drag-and-drop, click-to-select, filename preview, remove capability, and signed URL upload flow per ADR-003
- MUST validate required fields with inline error messages before allowing step advancement
- MUST auto-calculate totals (tuition, income, expenses) in real-time as values change
- MUST call `submitApplication()` Server Action on final submit
- MUST show success confirmation screen after successful submission
- MUST be mobile-first — fully functional at 320px width
- MUST follow brand spec: warm paper background, serif headings, bordered cards (no shadows), gold accents sparingly
</requirements>

## Subtasks
- [x] 6.1 Build form shell with enrollment window check, multi-step container, and client-side form state management
- [x] 6.2 Build sticky progress bar component with step indicators
- [x] 6.3 Build file upload component with drag-and-drop, signed URL upload, preview, and remove
- [x] 6.4 Build Step 1 (Applicant Data) with all fields, document uploads, and dynamic other-children list
- [x] 6.5 Build Step 2 (Student Data) with dynamic student cards, document uploads, and tuition/discount auto-calculation
- [x] 6.6 Build Steps 3–4 (Income & Expenses) with auto-sum totals and document uploads
- [x] 6.7 Build Step 5 (Vehicles, Volunteer, Benefactors) with dynamic lists and checkboxes

## Implementation Details

Form components are Client Components managing local state across steps. Each step validates before advancing. The form shell wraps all steps and manages navigation. File uploads use `createSignedUploadUrl` from task_03. Final submission calls `submitApplication` from task_03. See TechSpec 'Route Structure' for component paths under `app/(form)/`.

### Relevant Files
- `design/formulario.html` — complete visual reference for all 6 steps, field layout, validation, upload areas, and progress bar
- `docs/formulario_bolsa.pdf` — original paper form for field accuracy
- `docs/brand-spec.md` — design tokens and typography
- `design/design-system.html` — component styling reference

### Dependent Files
- `app/(form)/layout.tsx` — public form layout (logo, warm paper bg)
- `app/(form)/page.tsx` — enrollment check and form/closed-message render
- `app/(form)/_components/scholarship-form.tsx` — multi-step form container
- `app/(form)/_components/step-1-applicant.tsx` — parent/guardian data
- `app/(form)/_components/step-2-students.tsx` — student data + discount calc
- `app/(form)/_components/step-3-income.tsx` — family income
- `app/(form)/_components/step-4-expenses.tsx` — monthly expenses
- `app/(form)/_components/step-5-vehicles.tsx` — vehicles, volunteer, benefactors
- `app/(form)/_components/step-6-review.tsx` — summary + declaration
- `app/(form)/_components/progress-bar.tsx` — sticky step indicator
- `app/(form)/_components/file-upload.tsx` — drag-drop upload component
- `app/(form)/_components/success-screen.tsx` — post-submission confirmation

### Related ADRs
- [ADR-001: Faithful Digital Translation of Existing Paper Workflow](adrs/adr-001.md) — form must faithfully translate the paper form
- [ADR-003: Direct-to-Storage File Uploads with Signed URLs](adrs/adr-003.md) — file upload flow using signed URLs

## Deliverables
- Complete 6-step public scholarship form
- Sticky progress bar component
- Reusable file upload component
- Enrollment window closed state
- Success confirmation screen
- Mobile-responsive at 320px
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for form flow **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Progress bar renders correct number of steps with active/done/pending states
  - [x] Step 1 validates required parent fields (nome, CPF, RG) before allowing next
  - [x] Step 1 dynamic add/remove for other children works correctly
  - [x] Step 2 auto-calculates total tuition from student mensalidade values
  - [x] Step 2 dynamic add/remove for students updates totals
  - [x] Step 3 auto-sums income fields (pai + mae + outros)
  - [x] Step 4 auto-sums expense fields
  - [x] Step 5 dynamic add/remove for vehicles works correctly
  - [x] Step 6 renders read-only summary of all entered data
  - [x] Step 6 blocks submission if legal declaration checkbox is unchecked
  - [x] File upload component handles drag-and-drop file selection
  - [x] File upload component displays filename preview and supports remove
  - [x] Enrollment check shows closed message when no active school year
- Integration tests:
  - [x] Complete form flow: fill all steps → submit → success screen displayed
  - [x] File upload sends file to signed URL and stores path in form state
  - [x] Step validation prevents advancing with missing required fields
  - [x] Form is fully usable at 320px viewport width
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Form visually matches `design/formulario.html` prototype across all 6 steps
- All auto-calculations produce correct results
- File upload works end-to-end with signed URLs
- Form is fully functional on mobile (320px)
- Successful submission shows confirmation screen
