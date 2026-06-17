# TechSpec: ANSP Scholarship Management System

## Executive Summary

The ANSP Scholarship Management System is a Next.js 15 (App Router) application backed by Supabase (Postgres + Auth + Storage), deployed on Vercel. It provides two route groups: a public multi-step scholarship application form and a protected admin panel for the scholarship committee.

The primary technical trade-off is **simplicity over flexibility**: we use Supabase's integrated platform (database, auth, storage in one service) instead of best-of-breed individual services. This reduces integration complexity and speeds MVP delivery at the cost of tighter vendor coupling and fewer customization options per layer. Server Actions handle form submissions with Zod validation, while file uploads go directly from the client to Supabase Storage via signed URLs to avoid server-side bandwidth bottlenecks on Vercel's serverless infrastructure.

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────┐
│                     Vercel (CDN + Edge)              │
│  ┌───────────────────────────────────────────────┐   │
│  │           Next.js 15 App Router               │   │
│  │                                               │   │
│  │  /(form)          /admin                      │   │
│  │  Public form      Protected admin panel       │   │
│  │  Server Actions   Server Actions              │   │
│  │  RSC + Client     RSC + Client                │   │
│  └───────────────┬───────────────────────────────┘   │
└──────────────────┼───────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │   Supabase (SA)     │
        │                     │
        │  ┌───────────────┐  │
        │  │   Postgres    │  │
        │  │   + RLS       │  │
        │  └───────────────┘  │
        │  ┌───────────────┐  │
        │  │   Auth        │  │
        │  │   (email/pw)  │  │
        │  └───────────────┘  │
        │  ┌───────────────┐  │
        │  │   Storage     │  │
        │  │  (documents)  │  │
        │  └───────────────┘  │
        └─────────────────────┘
```

**Next.js App Router** — Two route groups:
- `/(form)` — Public-facing scholarship form. No auth required. Server Components render the form shell; Client Components handle multi-step state, dynamic fields, file uploads, and auto-calculations.
- `/admin` — Protected by Supabase Auth middleware. Server Components fetch application data; Client Components handle expand/collapse, filtering, decision actions, and template editing.

**Supabase Postgres** — Relational data store for applications, students, decisions, school years, and decision templates. Row Level Security (RLS) ensures public users can only INSERT applications, while admin users have full CRUD.

**Supabase Auth** — Email/password authentication for committee members. Session managed via `@supabase/ssr` with cookie-based auth. No public user accounts.

**Supabase Storage** — `documents` bucket for uploaded files (RG, income statements, bank statements, etc.). Public users upload via signed URLs; admin users read/download via authenticated requests.

### Data Flow

1. **Application Submission:** Client collects form data across 6 steps → files upload directly to Storage during each step → Server Action validates with Zod and inserts application + related records into Postgres → confirmation screen
2. **Admin Review:** Server Component fetches applications with RLS-filtered query → Client Component renders expandable cards → admin clicks approve/reject → Server Action updates application status, discount, and reason
3. **Decision Export:** Server Action reads application + active template → replaces tokens → returns .txt file as download

## Implementation Design

### Core Interfaces

```typescript
// Application submission payload (Zod schema)
interface ApplicationSubmission {
  escola: string;
  pai: { nome: string; rg: string; cpf: string; profissao?: string; documentos: string[] };
  mae: { nome: string; cpf: string; profissao?: string; documentos: string[] };
  certidao_casamento?: string[];
  endereco: string;
  cep?: string;
  telefone: string;
  email?: string;
  comprovante_endereco: string[];
  outros_filhos: Array<{ nome: string; cpf?: string; nascimento: string }>;
  alunos: Array<{
    nome: string; cpf?: string; serie: string;
    mensalidade: number; documentos: string[];
  }>;
  desconto_solicitado: number;
  renda: { pai?: number; mae?: number; outros?: number; pessoas: number };
  extrato_ir: string[];
  despesas: {
    aluguel?: number; servicos?: number; tv?: number;
    celular_plano?: number; celular_parcelas?: number; internet?: number;
  };
  extratos_bancarios: string[];
  veiculos: Array<{ marca: string; modelo: string; ano: string }>;
  colaboracao: {
    limpeza?: { ativo: boolean; vezes_semana?: number };
    mutirao?: { ativo: boolean; sabados?: number };
    arrecadacao?: boolean;
    benfeitores?: boolean;
    outros?: string;
  };
  indicacao_benfeitores: Array<{ nome: string; email: string }>;
}
```

```typescript
// Decision action
interface DecisionPayload {
  application_id: string;
  status: 'aprovada' | 'rejeitada';
  desconto_concedido?: number;
  motivo?: string;
}
```

### Data Models

#### `school_years`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| nome | text | NOT NULL |
| data_inicio | date | NOT NULL |
| data_fim | date | NOT NULL |
| ativo | boolean | NOT NULL, default false |
| created_at | timestamptz | default now() |

Constraint: only one row can have `ativo = true` at a time (enforced via trigger or application logic).

#### `applications`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| school_year_id | uuid | FK → school_years.id, NOT NULL |
| status | text | NOT NULL, default 'pendente', CHECK IN ('pendente','aprovada','rejeitada') |
| escola | text | NOT NULL |
| pai_nome | text | NOT NULL |
| pai_rg | text | NOT NULL |
| pai_cpf | text | NOT NULL |
| pai_profissao | text | |
| mae_nome | text | NOT NULL |
| mae_cpf | text | NOT NULL |
| mae_profissao | text | |
| endereco | text | NOT NULL |
| cep | text | |
| telefone | text | NOT NULL |
| email | text | |
| renda_pai | numeric(12,2) | |
| renda_mae | numeric(12,2) | |
| renda_outros | numeric(12,2) | |
| pessoas_domicilio | integer | NOT NULL |
| despesa_aluguel | numeric(12,2) | |
| despesa_servicos | numeric(12,2) | |
| despesa_tv | numeric(12,2) | |
| despesa_celular_plano | numeric(12,2) | |
| despesa_celular_parcelas | numeric(12,2) | |
| despesa_internet | numeric(12,2) | |
| desconto_solicitado | numeric(5,2) | NOT NULL |
| desconto_concedido | numeric(5,2) | |
| motivo | text | |
| data_envio | timestamptz | NOT NULL, default now() |
| data_decisao | timestamptz | |
| decided_by | uuid | FK → auth.users.id |

#### `students`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| application_id | uuid | FK → applications.id ON DELETE CASCADE, NOT NULL |
| nome | text | NOT NULL |
| cpf | text | |
| serie | text | NOT NULL |
| mensalidade | numeric(12,2) | NOT NULL |

#### `other_children`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| application_id | uuid | FK → applications.id ON DELETE CASCADE, NOT NULL |
| nome | text | NOT NULL |
| cpf | text | |
| nascimento | date | NOT NULL |

#### `vehicles`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| application_id | uuid | FK → applications.id ON DELETE CASCADE, NOT NULL |
| marca | text | NOT NULL |
| modelo | text | NOT NULL |
| ano | text | NOT NULL |

#### `collaboration`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| application_id | uuid | FK → applications.id ON DELETE CASCADE, UNIQUE, NOT NULL |
| limpeza | boolean | default false |
| limpeza_vezes_semana | integer | |
| mutirao | boolean | default false |
| mutirao_sabados | integer | |
| arrecadacao | boolean | default false |
| buscar_benfeitores | boolean | default false |
| outros | text | |

#### `benefactors`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| application_id | uuid | FK → applications.id ON DELETE CASCADE, NOT NULL |
| nome | text | NOT NULL |
| email | text | |

#### `documents`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| application_id | uuid | FK → applications.id ON DELETE CASCADE, NOT NULL |
| categoria | text | NOT NULL (e.g., 'rg_pai', 'certidao', 'comprovante_endereco', 'extrato_ir', 'extrato_bancario', 'rg_aluno', 'certidao_nascimento') |
| student_id | uuid | FK → students.id, nullable (for student-specific docs) |
| storage_path | text | NOT NULL |
| nome_arquivo | text | NOT NULL |
| mime_type | text | NOT NULL |
| tamanho_bytes | integer | NOT NULL |
| uploaded_at | timestamptz | default now() |

#### `decision_templates`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| tipo | text | NOT NULL, CHECK IN ('aprovacao','rejeicao') |
| cabecalho | text | NOT NULL |
| corpo | text | NOT NULL |
| rodape | text | NOT NULL |
| updated_at | timestamptz | default now() |

Seeded with the default templates from the HTML prototype.

### Row Level Security (RLS) Policies

**applications, students, other_children, vehicles, collaboration, benefactors, documents:**
- `INSERT`: allowed for anonymous users (public form submission)
- `SELECT`, `UPDATE`: allowed only for authenticated users (admin)
- `DELETE`: denied (applications are never deleted from the UI)

**school_years, decision_templates:**
- `SELECT`: allowed for anonymous users (form checks if enrollment is open)
- `INSERT`, `UPDATE`, `DELETE`: allowed only for authenticated users (admin)

**Storage bucket `documents`:**
- Upload: anonymous users can upload to `pending/*` paths
- Read/Download: authenticated users only

### API Endpoints

All data mutations use Next.js Server Actions. No REST API routes needed for MVP.

#### Server Actions — Public Form

| Action | Description | Input | Output |
|--------|-------------|-------|--------|
| `getActiveSchoolYear()` | Checks if enrollment is open | — | `{ open: boolean; year?: SchoolYear }` |
| `createSignedUploadUrl(filename, category)` | Generates signed upload URL for Supabase Storage | filename, category | `{ url: string; path: string }` |
| `submitApplication(data)` | Validates and inserts full application with related records | `ApplicationSubmission` (Zod-validated) | `{ success: boolean; id?: string; errors?: ZodError }` |

#### Server Actions — Admin

| Action | Description | Input | Output |
|--------|-------------|-------|--------|
| `getApplications(filter?)` | Fetches all applications with students, filtered by status | status filter | `Application[]` with nested students |
| `getApplicationDetail(id)` | Fetches full application with all related data | application ID | Full application with students, children, vehicles, collaboration, benefactors, documents |
| `getDocumentUrl(path)` | Generates signed download URL for a document | storage path | `{ url: string }` |
| `approveApplication(id, desconto, motivo?)` | Sets status='aprovada', stores discount and reason | ID, discount%, reason | `{ success: boolean }` |
| `rejectApplication(id, motivo?)` | Sets status='rejeitada', stores reason | ID, reason | `{ success: boolean }` |
| `exportDecision(id)` | Generates .txt decision letter from template | application ID | `{ content: string; filename: string }` |
| `getSchoolYears()` | Lists all school years | — | `SchoolYear[]` |
| `createSchoolYear(data)` | Creates a new school year | name, start, end | `{ success: boolean }` |
| `toggleSchoolYear(id)` | Activates/deactivates a school year | ID | `{ success: boolean }` |
| `deleteSchoolYear(id)` | Deletes a school year | ID | `{ success: boolean }` |
| `getTemplates()` | Fetches approval and rejection templates | — | `Template[]` |
| `saveTemplate(data)` | Updates a decision template | tipo, cabecalho, corpo, rodape | `{ success: boolean }` |

### Route Structure

```
app/
├── (form)/
│   ├── layout.tsx              # Public layout (logo, warm paper bg)
│   ├── page.tsx                # Enrollment check → form or closed message
│   ├── _components/
│   │   ├── scholarship-form.tsx    # Multi-step form container (client)
│   │   ├── step-1-applicant.tsx    # Parent/guardian data
│   │   ├── step-2-students.tsx     # Student data + discount calc
│   │   ├── step-3-income.tsx       # Family income
│   │   ├── step-4-expenses.tsx     # Monthly expenses
│   │   ├── step-5-vehicles.tsx     # Vehicles, volunteer, benefactors
│   │   ├── step-6-review.tsx       # Summary + declaration
│   │   ├── progress-bar.tsx        # Sticky step indicator
│   │   ├── file-upload.tsx         # Drag-drop upload component
│   │   └── success-screen.tsx      # Post-submission confirmation
│   └── _actions/
│       └── form-actions.ts         # Server Actions for form
├── admin/
│   ├── layout.tsx              # Admin layout (sidebar, topbar)
│   ├── page.tsx                # Redirects to /admin/solicitacoes
│   ├── solicitacoes/
│   │   └── page.tsx            # Application list + review + decide
│   ├── ano-letivo/
│   │   └── page.tsx            # School year management
│   ├── textos/
│   │   └── page.tsx            # Decision template editor
│   └── _components/
│       ├── sidebar.tsx
│       ├── topbar.tsx
│       ├── stats-dashboard.tsx
│       ├── application-card.tsx
│       ├── application-detail.tsx
│       ├── decision-actions.tsx
│       ├── school-year-form.tsx
│       ├── school-year-list.tsx
│       ├── template-editor.tsx
│       └── template-preview.tsx
├── login/
│   └── page.tsx                # Login form → Supabase Auth
├── layout.tsx                  # Root layout (fonts, metadata)
└── globals.css                 # Tailwind base + brand tokens
```

## Integration Points

### Supabase

- **Authentication:** `@supabase/ssr` for server-side session management. Middleware checks auth on `/admin/*` routes and redirects to `/login` if unauthenticated.
- **Database:** `@supabase/supabase-js` client created per-request in Server Actions/Components using cookies for auth context.
- **Storage:** Signed upload URLs generated server-side; client uploads directly. Signed download URLs generated for admin document access.
- **Error handling:** All Supabase calls wrapped with error handling; database errors surfaced as user-friendly messages in Server Action responses.

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|---------------------|-----------------|
| Next.js project | New | Greenfield application — no existing code affected | Initialize project with `create-next-app` |
| Supabase project | New | New Supabase project in SA region | Create project, configure RLS, seed templates |
| Vercel project | New | New deployment target | Link repo, configure env vars |
| design/ prototypes | Reference only | HTML prototypes serve as visual spec — not modified | Extract design tokens into Tailwind config |
| docs/brand-spec.md | Reference only | Brand tokens mapped to Tailwind theme | No modification needed |

## Testing Approach

### Unit Tests

- **Zod schemas:** Validate that correct data passes and malformed data (missing required fields, invalid CPF format, negative income values) is rejected
- **Token replacement:** Ensure decision letter template rendering replaces all tokens correctly and handles edge cases (missing optional fields, multiple students)
- **Auto-calculations:** Verify tuition totals, income sums, expense sums, and discount calculations

### Integration Tests

- **Application submission flow:** Submit a complete application via Server Action, verify all records created in Postgres (application + students + documents + collaboration + benefactors)
- **Decision flow:** Approve and reject applications, verify status updates, discount storage, and decision timestamp
- **School year activation:** Create, activate, deactivate school years; verify only-one-active constraint
- **Auth guard:** Verify admin routes redirect unauthenticated users to login; verify public form routes are accessible without auth

### Test Infrastructure

- Supabase local development via `supabase` CLI (local Postgres + Auth + Storage emulator)
- Vitest for unit tests
- Playwright for end-to-end tests against local dev server

## Development Sequencing

### Build Order

1. **Project scaffolding + Supabase setup** — no dependencies
   - Initialize Next.js project with TypeScript, Tailwind, shadcn/ui
   - Create Supabase project (SA region), define all tables, RLS policies, and storage bucket
   - Configure Tailwind theme with brand tokens from `docs/brand-spec.md`
   - Set up `@supabase/ssr` client utilities
   - Configure Vercel project with Supabase env vars

2. **Auth + admin layout** — depends on step 1
   - Implement login page with Supabase Auth (email/password)
   - Create middleware for `/admin/*` route protection
   - Build admin layout (topbar with logo, sidebar navigation, logout)

3. **School year management (F6)** — depends on step 2
   - Build school year CRUD (create, list, activate/deactivate, delete)
   - Implement only-one-active constraint
   - This is needed before the form (form checks active year)

4. **Decision templates (F5)** — depends on step 2
   - Build template editor with tabs (aprovação/rejeição)
   - Implement live preview with token replacement
   - Seed default templates via migration
   - Can be built in parallel with step 3

5. **Public form — steps 1-5 (F1 partial)** — depends on steps 1 and 3
   - Build multi-step form container with progress bar
   - Implement each step as a Client Component with form state
   - Build file upload component with signed URL flow
   - Implement dynamic lists (students, children, vehicles, benefactors)
   - Implement auto-calculations (tuition total, income total, expenses total, discount)
   - Implement enrollment window check (active school year dates)

6. **Public form — step 6 + submission (F1 complete)** — depends on step 5
   - Build review/summary step rendering all entered data
   - Implement legal declaration checkbox with validation
   - Build Server Action for full application submission (Zod validation + multi-table insert)
   - Build success confirmation screen

7. **Application review & decision (F3)** — depends on steps 2 and 6
   - Build stats dashboard (aggregate counts by status)
   - Build application card list with status filters
   - Build expandable detail view with all application data
   - Implement document preview/download via signed URLs
   - Build approve/reject actions with discount and reason fields

8. **Decision export (F4)** — depends on steps 4 and 7
   - Implement .txt decision letter generation with token replacement
   - Wire export button to download the generated file

### Technical Dependencies

- **Supabase project creation** — must be done before any development (database schema, auth config, storage bucket)
- **Vercel project creation** — needed for deployment but not for local development
- **Domain/DNS configuration** — needed before production launch but not for development
- **Committee member accounts** — must be created in Supabase Auth before admin panel can be used (can be seeded)

## Monitoring and Observability

- **Vercel Analytics** — page load times, Web Vitals, serverless function duration
- **Supabase Dashboard** — database query performance, storage usage, auth events, API request logs
- **Error tracking:** Vercel's built-in error logging for Server Action failures; Supabase logs for database/storage errors
- **Key metrics to watch:**
  - Form submission success rate (Server Action success vs. error responses)
  - File upload failure rate (signed URL generation + upload completion)
  - Admin page load time (application list query performance)
  - Storage usage (document accumulation over enrollment period)

## Technical Considerations

### Key Decisions

- **Flat application table vs. normalized parent entities:** Chose to store parent data directly in the `applications` table rather than creating separate `parents` table. Rationale: each application is a self-contained snapshot of family data at submission time; normalizing parents would add complexity without clear benefit since families don't have accounts and may reapply with different data next year. Trade-off: some data duplication if the same family applies for multiple years.

- **Server Actions vs. API Routes:** Chose Server Actions for all mutations. Rationale: tighter integration with React components, automatic request/response serialization, no manual fetch wiring. Trade-off: harder to call from non-React clients (not needed for MVP).

- **Client-side multi-step state vs. server-side per-step persistence:** Chose client-side state (React state/context) for form data across the 6 steps, with a single server submission at the end. Rationale: save-and-resume is explicitly out of scope for MVP; client-side state is simpler and avoids creating draft records in the database. Trade-off: if the user's browser crashes or closes, all progress is lost.

### Known Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Orphaned files in Storage from abandoned form sessions | High | Scheduled cleanup function (Supabase Edge Function or cron) that deletes `pending/*` files older than 48 hours not referenced by any application |
| Supabase free tier limits hit during enrollment peak | Medium | Monitor usage via Supabase dashboard; upgrade to Pro plan ($25/mo) before enrollment window if projections warrant it |
| Large application list slows admin page | Low (small user base) | Pagination and index on `status` + `data_envio` columns; unlikely to be an issue with <500 applications per year |
| CPF validation edge cases | Low | Use a well-tested CPF validation library (e.g., `cpf-cnpj-validator`); validate both format and check digits |

## Architecture Decision Records

- [ADR-001: Faithful Digital Translation of Existing Paper Workflow](adrs/adr-001.md) — Build the MVP as a direct digitization of the paper process, matching HTML prototypes, deferring collaboration and compliance features
- [ADR-002: Next.js App Router + Supabase + shadcn/ui Tech Stack](adrs/adr-002.md) — Use Next.js 15 with Supabase (Postgres + Auth + Storage) in São Paulo region, shadcn/ui + Tailwind for UI, deployed on Vercel
- [ADR-003: Direct-to-Storage File Uploads with Signed URLs](adrs/adr-003.md) — Client uploads files directly to Supabase Storage via time-limited signed URLs, bypassing the server to avoid bandwidth/memory constraints on Vercel serverless
