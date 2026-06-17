# ANSP — Sistema de Solicitação de Bolsa

Sistema web de solicitação de bolsa de estudo para famílias necessitadas, desenvolvido para a **Arca Nossa Senhora da Providência (ANSP)** — associação mantenedora dos colégios da Tradição Católica no Brasil (Colégio São José / ACIPEC / FSSPX, Itatiba-SP).

## O que faz

- **Formulário público** — formulário online de 6 etapas que substitui o processo em papel, coletando dados dos pais, alunos, renda, despesas, veículos, compromissos de voluntariado e documentos comprobatórios
- **Painel administrativo** — interface para o comitê de bolsas revisar solicitações, aprovar/rejeitar com percentual de desconto, gerenciar anos letivos e personalizar modelos de carta de decisão
- **Exportação de decisão** — geração de carta de aprovação ou rejeição em `.txt` com substituição automática de tokens

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **Supabase** (Postgres + Auth + Storage) — local via Supabase CLI no dev; região São Paulo em produção
- **Tailwind CSS 4** + **shadcn/ui**
- **Zod** para validação de schemas
- **Vitest** para testes
- Deploy via **Vercel**

## Pré-requisitos

- Node.js 20+
- npm 10+
- [Docker](https://docs.docker.com/get-docker/) (necessário para o Supabase rodar localmente)

> Não é preciso criar conta no Supabase para desenvolver — todo o stack (Postgres + Auth + Storage + Studio) roda localmente via Supabase CLI.

## Setup local

1. **Clone o repositório**

```bash
git clone <repo-url>
cd ansp
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env.local
```

O `.env.example` já vem preenchido com os valores padrão do Supabase local — não é preciso alterar nada para desenvolver.

4. **Suba o Supabase local**

Com o Docker rodando, inicie o stack local. Na primeira vez o CLI baixa as imagens, aplica as migrations de `supabase/migrations/` e roda o seed de `supabase/seed.sql` (templates de carta e ano letivo de exemplo):

```bash
npm run db:start
```

Ao final, o CLI imprime as URLs e chaves do stack local:

- **API URL** — `http://127.0.0.1:54321`
- **Studio** (painel do banco) — `http://127.0.0.1:54323`
- **anon key** — já configurada no `.env.example`

> Para recriar o banco do zero (reaplica migrations + seed), use `npm run db:reset`. Para parar o stack, `npm run db:stop`. Para ver o status e as chaves a qualquer momento, `npm run db:status`.

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse:
- Formulário público: [http://localhost:3000](http://localhost:3000)
- Login admin: [http://localhost:3000/login](http://localhost:3000/login)
- Painel admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Credenciais de acesso

### Desenvolvimento local

Com `AUTH_BYPASS=true` (local ou Vercel), o login aceita credenciais fixas sem precisar criar usuários no Supabase Auth:

| Campo | Valor |
|-------|-------|
| Email | `admin@admin.com` |
| Senha | `admin123` |

> Requer também `SUPABASE_SERVICE_ROLE_KEY` configurada — o painel admin usa a service role para contornar RLS quando não há sessão Supabase real. **Não use `AUTH_BYPASS` em produção final** — crie contas reais no Supabase Auth (abaixo).

### Produção

Contas do comitê são criadas no Supabase Dashboard > Authentication > Users com email/senha. Não há cadastro público — apenas o formulário de bolsa é acessível sem autenticação.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build de produção |
| `npm run lint` | Linting com ESLint |
| `npm test` | Executa os testes |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run db:start` | Sobe o Supabase local (Postgres + Auth + Storage + Studio) |
| `npm run db:stop` | Para o Supabase local |
| `npm run db:status` | Mostra URLs e chaves do stack local |
| `npm run db:reset` | Recria o banco: reaplica migrations + seed |

## Estrutura do projeto

```
app/
├── (form)/          # Formulário público (6 etapas)
├── admin/           # Painel administrativo (solicitações, ano letivo, textos)
├── login/           # Tela de autenticação
└── layout.tsx       # Layout raiz

lib/
├── supabase/        # Clientes Supabase (server, client, middleware)
├── validations/     # Schemas Zod e validação de CPF
└── templates/       # Substituição de tokens para cartas de decisão

supabase/
├── migrations/      # SQL: tabelas, RLS, storage, triggers
└── seed.sql         # Dados iniciais (templates de carta)

design/              # Protótipos HTML (referência visual)
docs/                # Brand spec e formulário original em PDF
```
