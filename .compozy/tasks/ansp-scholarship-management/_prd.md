# PRD: ANSP Scholarship Management System

## Overview

The ANSP Scholarship Management System digitizes the paper-based scholarship application process for Arca Nossa Senhora da Providência (ANSP), the nonprofit association (mantenedora) that manages scholarship programs for colégios da Tradição Católica no Brasil.

**Problem:** Families currently fill out a 5-page paper form, deliver physical documents to the school, and wait for a committee decision communicated by phone or letter. The paper process is error-prone (illegible handwriting, missing documents, lost forms), slow (manual routing between committee members), and unauditable (no central record of decisions).

**Solution:** A web application with two interfaces: a public multi-step scholarship application form and a private admin panel for the committee to review, decide, and export decisions. The system faithfully translates the existing paper workflow into digital form.

**Users:** Applicant families (parents/guardians) and a scholarship committee of 2-5 school staff members.

**Value:** Eliminates paper handling, centralizes all applications and documents in one place, enables the committee to review from any device, produces consistent decision letters, and creates a searchable record of all scholarship decisions.

## Goals

- **Digitize 100% of scholarship applications** for the 2026 school year — no parallel paper process needed
- **Reduce application processing time** from weeks (paper routing) to days (centralized digital review)
- **Zero lost applications or documents** — all submissions persist in cloud storage with backups
- **Committee alignment** — all members see the same data and decisions in real time
- **Production-ready before the 2026 enrollment window opens** — system must be live before the Ano Letivo start date

## User Stories

### Applicant Family (Parent/Guardian)

- As a parent, I want to fill out the scholarship application online so that I don't need to visit the school in person to submit paperwork
- As a parent, I want to upload required documents (RG, income tax statement, bank statements) directly in the form so that I don't need to deliver photocopies
- As a parent, I want to see a progress indicator so that I know how many steps remain
- As a parent, I want to review all my answers before submitting so that I can catch mistakes
- As a parent, I want to receive confirmation that my application was submitted so that I know it was received

### Committee Member (Admin)

- As a committee member, I want to log in with my own credentials so that I can access the admin panel securely
- As a committee member, I want to see a dashboard of pending, approved, and rejected applications so that I know the current workload
- As a committee member, I want to filter applications by status so that I can focus on pending reviews
- As a committee member, I want to expand an application to see all family, income, expense, and vehicle data so that I can assess need
- As a committee member, I want to preview or download uploaded documents (RG, income statements, bank statements) so that I can verify information without leaving the admin panel
- As a committee member, I want to approve an application with a specific discount percentage (which may differ from the requested amount) so that the committee controls the actual scholarship value
- As a committee member, I want to reject an application with an optional reason so that the decision is documented
- As a committee member, I want to export a decision letter (approval or rejection) using customizable templates so that families receive a consistent, branded communication
- As a committee member, I want to manage school years (create, activate, deactivate) so that the application form opens and closes at the right times
- As a committee member, I want to customize the approval and rejection letter templates so that the wording can be updated each year without developer involvement

## Core Features

### F1: Multi-Step Scholarship Application Form

A 6-step public form that collects all information currently gathered by the paper form:

1. **Applicant Data** — Parent/guardian names, CPF, RG, profession, address, phone, email, document uploads (RG of both parents, marriage certificate, proof of address), and a list of other children not enrolled in the school
2. **Student Data** — One or more students with name, CPF, grade (Maternal through 3º EM), monthly tuition amount, and document uploads (student RG/CPF, birth certificate). Auto-calculates total tuition and applies a requested discount percentage
3. **Family Income** — Father's income, mother's income, other household income, total (auto-summed), number of people in household, and income tax statement upload
4. **Monthly Expenses** — Rent, utilities, TV/streaming, cell phone plan, cell phone installments, internet. Auto-calculates total. Upload of last 3 months' bank statements from all family accounts
5. **Vehicles & Volunteer Commitments** — List of family vehicles (brand, model, year). Volunteer availability checkboxes (school cleaning, men's work brigade, fundraising, seeking benefactors, other). List of 10 potential benefactors (name + email)
6. **Review & Submission** — Read-only summary of all entered data. Legal declaration checkbox (sworn statement that all information is truthful). Submit button

**Behaviors:**

- Sticky progress bar showing current step and completion state
- Required field validation with inline error messages before advancing to next step
- File upload via drag-and-drop or click, with filename preview and remove capability
- Dynamic add/remove for students, other children, and vehicles
- Auto-calculation of totals (tuition, income, expenses) as values are entered
- On successful submission: confirmation screen with success message
- Form is only accessible when the active Ano Letivo's enrollment period is open; outside this window, a "closed" message is displayed

### F2: Admin Authentication

Login screen for committee members with individual credentials. Successful login grants access to the admin panel. Session persists until explicit logout.

### F3: Application Review & Decision

The default admin view showing all submitted applications:

- **Stats dashboard** — Counts of pending, approved, and rejected applications
- **Status filters** — Filter the list by Todos / Pendente / Aprovada / Rejeitada
- **Expandable application cards** — Each card shows family names, status badge, school, submission date, number of students, and requested discount. Expanding reveals all form data organized in sections (applicant details, students table, income & expenses, vehicles, volunteer commitments)
- **Document access** — Admin can preview PDF documents inline in the browser and download any uploaded file for each application
- **Decision actions** (for pending applications):
  - Approve: set the granted discount percentage (pre-filled with requested amount, editable) and optional reason
  - Reject: optional reason
- **Decision display** (for decided applications): shows status, granted discount (if approved), reason, and an "Export Decision" button

### F4: Decision Letter Export

- **Individual export:** Generates a .txt decision letter for a specific application using the active template. Replaces tokens ({nome_pai}, {nome_mae}, {escola}, {aluno}, {desconto}, {data}, {motivo}, {ano_letivo}) with application data

### F5: Decision Letter Templates

Admin view for customizing the text of approval and rejection letters:

- Two tabs: Aprovação and Rejeição
- Each template has three editable sections: header, body, footer
- Available token reference displayed above the editor
- Live preview panel showing the template rendered with sample data
- Templates persist and are used by the export feature (F4)

### F6: School Year Management

Admin view for managing enrollment periods:

- List of school years with name, start date, end date, and active status
- Create new school year (name + start date + end date)
- Activate/deactivate a school year (only one active at a time)
- Delete a school year
- The active school year's date range controls when the public form (F1) is accessible

## User Experience

### Applicant Family Journey

1. Family navigates to the form URL
2. If the enrollment period is open, the 6-step form loads with Step 1 visible
3. Family fills out each step, uploading documents as required, and advances with the "Próximo" button
4. At Step 6, family reviews all entered data, checks the legal declaration, and submits
5. A confirmation screen appears: "Solicitação Enviada" — the school will contact them offline with the decision
6. If the enrollment period is closed, a message indicates the form is not currently accepting applications

### Committee Member Journey

1. Committee member navigates to the admin URL and logs in
2. The Solicitações view loads by default, showing the stats dashboard and all applications
3. Member filters to "Pendente" and expands an application card to review
4. Member previews PDFs inline or downloads uploaded documents to verify income and identity claims
5. Member approves (with a discount %) or rejects (with a reason) the application
6. Member exports the decision letter for the family
7. Between cycles, member updates decision letter templates and creates/activates a new school year

### UI/UX Considerations

- **Mobile-first form design** — Many applicant families will access the form on smartphones. All form steps must be fully functional at 320px width
- **Institutional visual identity** — The brand spec (navy, gold, warm paper, serif headings) must be faithfully applied. The circular seal logo appears on login and admin header
- **Accessibility** — Semantic HTML, ARIA attributes, keyboard navigation, focus management, and sufficient color contrast throughout
- **Portuguese (pt-BR)** — All user-facing text in Brazilian Portuguese

## High-Level Technical Constraints

- **Cloud database** for application data — must support concurrent reads by multiple committee members
- **Cloud file storage** for uploaded documents — must handle images and PDFs up to reasonable size limits
- **HTTPS required** — sensitive personal and financial data (CPF, income, bank statements) must be encrypted in transit
- **Data privacy** — uploaded documents and personal data must not be publicly accessible; only authenticated admin users can access application data
- **Brazilian data residency preferred** — LGPD compliance; data should reside in Brazil or a jurisdiction with adequate protection
- **No external font loading** — typography uses system font stacks per the brand spec

## Non-Goals (Out of Scope)

- **Family status tracking portal** — families do not get a login or online status page; communication is offline
- **Save-and-resume for the form** — families must complete the form in a single session (defer to Phase 2)
- **Committee collaboration features** — no application assignment, internal comments, or audit trail (defer to Phase 2)
- **Automated income analysis** — no per-capita income calculation or PROUNI threshold flagging; the committee assesses need manually
- **PDF decision letters** — MVP exports .txt; branded PDF generation is deferred
- **Email/SMS notifications** — no automated messages to families or committee members
- **Multi-language support** — Portuguese only
- **Integration with school management systems** (Activesoft, Escolaweb, etc.)
- **CEBAS compliance dashboard** — gratuidade tracking is handled outside this system
- **Payment or billing integration** — this system tracks scholarships, not tuition collection

## Phased Rollout Plan

### MVP (Phase 1) — Target: Before 2026 Enrollment Window

**Scope:** All six core features (F1–F6) as described above.

**Success criteria:**

- At least one complete scholarship cycle processed through the system (applications received, reviewed, decided, letters exported)
- Committee confirms the digital workflow replaces the paper process without gaps
- Zero data loss incidents

### Phase 2 — Post-First-Cycle Enhancements

- Save-and-resume for the application form (with draft status visible to admin)
- Application assignment to specific committee members
- Internal notes/comments per application
- Decision audit trail (who decided, when, with what parameters)
- Per-capita income auto-calculation and threshold indicators

**Success criteria:**

- Committee reports improved coordination with assignment and comments
- Average form completion rate increases with save-and-resume

### Phase 3 — Operational Maturity

- Branded PDF decision letter generation
- Email notifications to families on status change (opt-in)
- Compliance reporting dashboard (gratuidade percentage, CEBAS metrics)
- Historical analytics (year-over-year trends, discount distribution)
- Integration with school management system for enrollment handoff

**Success criteria:**

- System serves as the single source of truth for scholarship administration
- CEBAS audit documentation can be generated directly from the system

## Success Metrics

- **Application submission rate:** ≥90% of eligible families submit digitally (vs. paper) in the first cycle
- **Form completion rate:** ≥70% of families who start the form successfully submit it
- **Processing time:** Average time from submission to decision ≤ 5 business days (vs. weeks with paper)
- **Committee adoption:** All committee members actively use the admin panel (≥1 login per week during review period)
- **Data completeness:** ≥95% of submissions have all required documents uploaded
- **Zero data loss:** No applications or documents lost after submission

## Risks and Mitigations


| Risk                                                | Impact                             | Likelihood | Mitigation                                                                                                                      |
| --------------------------------------------------- | ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Families lack digital literacy or smartphone access | Some families cannot submit online | Medium     | Provide a school-based kiosk or staff-assisted submission option; keep paper form as fallback for the first cycle               |
| Form is too long — families abandon mid-way         | Low completion rate                | Medium     | Clear progress indicator, 6 manageable steps (matching the paper form they already know); prioritize save-and-resume in Phase 2 |
| Committee members resist changing from paper        | Low adoption                       | Low        | The system mirrors the paper workflow exactly; minimal learning curve. Involve committee in UAT                                 |
| Document upload failures on slow connections        | Incomplete submissions             | Medium     | Allow common file formats, set reasonable size limits, show upload progress, provide clear error messages                       |
| Enrollment window too short for digital transition  | System not ready or not tested     | Medium     | Target system launch well before enrollment opens; run a pilot with demo data before going live                                 |


## Architecture Decision Records

- [ADR-001: Faithful Digital Translation of Existing Paper Workflow](adrs/adr-001.md) — Build the MVP as a direct digitization of the paper scholarship process, matching existing HTML prototypes, with committee individual logins and period-controlled form availability

## Open Questions

1. **Exact number of committee members and their names/emails** — needed to set up initial admin accounts
2. **Maximum file upload size** — what is the acceptable limit per document? (e.g., 5MB, 10MB)
3. **Enrollment window dates for 2026** — when does the form need to be live?
4. **Fallback for families who cannot submit digitally** — should school staff be able to submit on behalf of a family through the admin panel?
5. **Data retention policy** — how long should application data and documents be kept after a decision is made?
6. **Which colégios da Tradição are in scope for launch** — all affiliated schools or a subset for the initial rollout?

