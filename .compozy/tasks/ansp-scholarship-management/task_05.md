---
status: completed
title: Login page & admin layout
type: frontend
complexity: medium
dependencies:
  - task_03
---

# Task 05: Login page & admin layout

## Overview

Build the login page (email/password form with error display, ANSP seal logo) and the admin shell layout (topbar with logo and logout, sidebar with navigation for Solicitações, Ano Letivo, and Textos). These provide the authentication entry point and the shared chrome for all admin views.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement login page at `/login` matching `design/login.html` visual design (centered card, SVG seal logo, email/password fields, error banner)
- MUST call the `login` Server Action from task_03 on form submit
- MUST display inline error message on failed login (invalid credentials)
- MUST redirect to `/admin/solicitacoes` on successful login
- MUST implement admin layout at `app/admin/layout.tsx` with topbar (ANSP logo, system title, logout button) and sidebar navigation
- MUST have sidebar links for: Solicitações (`/admin/solicitacoes`), Ano Letivo (`/admin/ano-letivo`), Textos (`/admin/textos`)
- MUST highlight active sidebar link based on current route
- MUST implement logout button calling the `logout` Server Action
- MUST redirect `/admin` to `/admin/solicitacoes`
- MUST be responsive — sidebar collapses to hamburger menu on mobile
- MUST follow brand spec: navy accent, serif display headings, no shadows, 8px radius, gold used sparingly
</requirements>

## Subtasks
- [x] 5.1 Build the login page with form, SVG seal logo, and error handling
- [x] 5.2 Wire login form to the auth Server Action with loading state
- [x] 5.3 Build the admin topbar component with logo, title, and logout
- [x] 5.4 Build the admin sidebar with navigation links and active state
- [x] 5.5 Implement responsive sidebar (hamburger toggle on mobile)
- [x] 5.6 Create admin layout combining topbar + sidebar + content area

## Implementation Details

Login page follows `design/login.html` prototype. Admin layout follows `design/admin.html` prototype structure. The SVG seal logo is defined inline in the login prototype — extract as a reusable component. See TechSpec 'Route Structure' section for file paths.

### Relevant Files
- `design/login.html` — visual reference and SVG seal markup
- `design/admin.html` — admin layout structure (topbar, sidebar, content)
- `docs/brand-spec.md` — design tokens and posture guidelines
- `design/logo-gesso.jpg` — logo image asset
- `design/base1.png` — Our Lady painting for SVG seal

### Dependent Files
- `app/login/page.tsx` — login page
- `app/admin/layout.tsx` — admin shell layout
- `app/admin/page.tsx` — redirect to solicitacoes
- `app/admin/_components/sidebar.tsx` — sidebar navigation
- `app/admin/_components/topbar.tsx` — topbar with logout
- `components/ui/seal-logo.tsx` — reusable SVG seal component

## Deliverables
- Login page at `/login` with full auth flow
- Admin layout with topbar and sidebar navigation
- Responsive sidebar with mobile hamburger
- Reusable SVG seal logo component
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for login flow **(REQUIRED)**

## Tests
- Unit tests:
  - [x] Login form renders email and password fields
  - [x] Login form displays error message when login action returns error
  - [x] Login form shows loading state during submission
  - [x] Sidebar renders all three navigation links
  - [x] Sidebar highlights the correct active link based on pathname
  - [x] Topbar renders logo and logout button
- Integration tests:
  - [x] Submitting valid credentials on login page redirects to `/admin/solicitacoes`
  - [x] Submitting invalid credentials shows error message without redirect
  - [x] Clicking logout redirects to `/login`
  - [x] `/admin` redirects to `/admin/solicitacoes`
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Login page visually matches `design/login.html` prototype
- Admin layout provides consistent chrome across all admin views
- Sidebar navigation works and highlights active route
- Responsive: sidebar collapses on mobile viewports
