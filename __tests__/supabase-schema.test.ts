import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const MIGRATIONS_DIR = join(__dirname, "../supabase/migrations");
const SEED_FILE = join(__dirname, "../supabase/seed.sql");

function readMigration(filename: string): string {
  return readFileSync(join(MIGRATIONS_DIR, filename), "utf-8");
}

function readAllMigrations(): string {
  const files = readdirSync(MIGRATIONS_DIR).sort();
  return files.map((f) => readMigration(f)).join("\n");
}

describe("Supabase migrations", () => {
  it("migration files exist and are ordered", () => {
    const files = readdirSync(MIGRATIONS_DIR).sort();
    expect(files.length).toBeGreaterThanOrEqual(4);
    expect(files[0]).toMatch(/^\d{14}_/);
    for (let i = 1; i < files.length; i++) {
      expect(files[i] > files[i - 1]).toBe(true);
    }
  });

  it("SQL files have no syntax-breaking issues", () => {
    const files = readdirSync(MIGRATIONS_DIR).sort();
    for (const file of files) {
      const sql = readMigration(file);
      expect(sql.length).toBeGreaterThan(0);
      const opens = (sql.match(/\(/g) || []).length;
      const closes = (sql.match(/\)/g) || []).length;
      expect(opens).toBe(closes);
      expect(sql).not.toMatch(/;;;/);
    }
  });
});

describe("Table definitions", () => {
  const allSql = readAllMigrations();

  const expectedTables = [
    "school_years",
    "applications",
    "students",
    "other_children",
    "vehicles",
    "collaboration",
    "benefactors",
    "documents",
    "decision_templates",
  ];

  it("creates all 9 required tables", () => {
    for (const table of expectedTables) {
      expect(allSql).toContain(`create table public.${table}`);
    }
  });

  describe("school_years", () => {
    it("has correct columns", () => {
      expect(allSql).toMatch(/id uuid primary key default gen_random_uuid\(\)/);
      expect(allSql).toContain("nome text not null");
      expect(allSql).toContain("data_inicio date not null");
      expect(allSql).toContain("data_fim date not null");
      expect(allSql).toContain("ativo boolean not null default false");
      expect(allSql).toContain("created_at timestamptz not null default now()");
    });

    it("has unique partial index for only-one-active constraint", () => {
      expect(allSql).toMatch(
        /create unique index\s+school_years_only_one_active/
      );
      expect(allSql).toMatch(
        /on public\.school_years \(ativo\) where \(ativo = true\)/
      );
    });

    it("has trigger to enforce single active school year", () => {
      expect(allSql).toContain(
        "enforce_single_active_school_year"
      );
      expect(allSql).toMatch(
        /create trigger.*trg_enforce_single_active_school_year/
      );
      expect(allSql).toMatch(
        /before insert or update of ativo on public\.school_years/
      );
    });
  });

  describe("applications", () => {
    it("has correct columns and constraints", () => {
      expect(allSql).toContain(
        "school_year_id uuid not null references public.school_years(id)"
      );
      expect(allSql).toMatch(
        /status text not null default 'pendente'.*check.*status in.*'pendente'.*'aprovada'.*'rejeitada'/s
      );
      expect(allSql).toContain("pai_nome text not null");
      expect(allSql).toContain("pai_rg text not null");
      expect(allSql).toContain("pai_cpf text not null");
      expect(allSql).toContain("mae_nome text not null");
      expect(allSql).toContain("mae_cpf text not null");
      expect(allSql).toContain("endereco text not null");
      expect(allSql).toContain("telefone text not null");
      expect(allSql).toContain("pessoas_domicilio integer not null");
      expect(allSql).toContain("desconto_solicitado numeric(5,2) not null");
      expect(allSql).toContain("renda_pai numeric(12,2)");
      expect(allSql).toContain("renda_mae numeric(12,2)");
      expect(allSql).toContain("despesa_aluguel numeric(12,2)");
      expect(allSql).toContain("desconto_concedido numeric(5,2)");
      expect(allSql).toContain(
        "decided_by uuid references auth.users(id)"
      );
      expect(allSql).toContain("data_envio timestamptz not null default now()");
    });

    it("has performance indexes", () => {
      expect(allSql).toMatch(
        /create index.*applications_status_data_envio_idx/
      );
      expect(allSql).toMatch(
        /create index.*applications_school_year_id_idx/
      );
    });
  });

  describe("students", () => {
    it("has correct columns with cascade delete", () => {
      expect(allSql).toMatch(
        /application_id uuid not null references public\.applications\(id\) on delete cascade/
      );
      expect(allSql).toContain("serie text not null");
      expect(allSql).toContain("mensalidade numeric(12,2) not null");
    });
  });

  describe("other_children", () => {
    it("has correct columns with cascade delete", () => {
      const tableSection = allSql.slice(
        allSql.indexOf("create table public.other_children"),
        allSql.indexOf(
          "create table",
          allSql.indexOf("create table public.other_children") + 1
        )
      );
      expect(tableSection).toContain("on delete cascade");
      expect(tableSection).toContain("nascimento date not null");
    });
  });

  describe("vehicles", () => {
    it("has correct columns with cascade delete", () => {
      const tableSection = allSql.slice(
        allSql.indexOf("create table public.vehicles"),
        allSql.indexOf(
          "create table",
          allSql.indexOf("create table public.vehicles") + 1
        )
      );
      expect(tableSection).toContain("on delete cascade");
      expect(tableSection).toContain("marca text not null");
      expect(tableSection).toContain("modelo text not null");
      expect(tableSection).toContain("ano text not null");
    });
  });

  describe("collaboration", () => {
    it("has unique constraint on application_id and cascade delete", () => {
      const tableSection = allSql.slice(
        allSql.indexOf("create table public.collaboration"),
        allSql.indexOf(
          "create table",
          allSql.indexOf("create table public.collaboration") + 1
        )
      );
      expect(tableSection).toContain("on delete cascade");
      expect(tableSection).toMatch(/unique/i);
      expect(tableSection).toContain("limpeza boolean");
      expect(tableSection).toContain("mutirao boolean");
      expect(tableSection).toContain("arrecadacao boolean");
      expect(tableSection).toContain("buscar_benfeitores boolean");
    });
  });

  describe("benefactors", () => {
    it("has correct columns with cascade delete", () => {
      const tableSection = allSql.slice(
        allSql.indexOf("create table public.benefactors"),
        allSql.indexOf(
          "create table",
          allSql.indexOf("create table public.benefactors") + 1
        )
      );
      expect(tableSection).toContain("on delete cascade");
      expect(tableSection).toContain("nome text not null");
      expect(tableSection).toContain("email text");
    });
  });

  describe("documents", () => {
    it("has correct columns with cascade delete", () => {
      const tableSection = allSql.slice(
        allSql.indexOf("create table public.documents"),
        allSql.indexOf(
          "create table",
          allSql.indexOf("create table public.documents") + 1
        )
      );
      expect(tableSection).toContain(
        "application_id uuid not null references public.applications(id) on delete cascade"
      );
      expect(tableSection).toContain("categoria text not null");
      expect(tableSection).toContain(
        "student_id uuid references public.students(id)"
      );
      expect(tableSection).toContain("storage_path text not null");
      expect(tableSection).toContain("nome_arquivo text not null");
      expect(tableSection).toContain("mime_type text not null");
      expect(tableSection).toContain("tamanho_bytes integer not null");
    });
  });

  describe("decision_templates", () => {
    it("has correct columns and type constraint", () => {
      const tableSection = allSql.slice(
        allSql.indexOf("create table public.decision_templates")
      );
      expect(tableSection).toMatch(
        /tipo text not null check.*tipo in.*'aprovacao'.*'rejeicao'/s
      );
      expect(tableSection).toContain("cabecalho text not null");
      expect(tableSection).toContain("corpo text not null");
      expect(tableSection).toContain("rodape text not null");
      expect(tableSection).toContain("updated_at timestamptz");
    });
  });
});

describe("RLS policies", () => {
  const allSql = readAllMigrations();

  const applicationTables = [
    "applications",
    "students",
    "other_children",
    "vehicles",
    "collaboration",
    "benefactors",
    "documents",
  ];

  it("enables RLS on all tables", () => {
    const allTables = [
      ...applicationTables,
      "school_years",
      "decision_templates",
    ];
    for (const table of allTables) {
      expect(allSql).toContain(
        `alter table public.${table} enable row level security`
      );
    }
  });

  it("allows anonymous INSERT on application-related tables", () => {
    for (const table of applicationTables) {
      const insertPolicy = new RegExp(
        `create policy.*on public\\.${table} for insert.*to anon`,
        "s"
      );
      expect(allSql).toMatch(insertPolicy);
    }
  });

  it("allows authenticated SELECT on application-related tables", () => {
    for (const table of applicationTables) {
      const selectPolicy = new RegExp(
        `create policy.*on public\\.${table} for select.*to authenticated`,
        "s"
      );
      expect(allSql).toMatch(selectPolicy);
    }
  });

  it("allows authenticated UPDATE on application-related tables", () => {
    for (const table of applicationTables) {
      const updatePolicy = new RegExp(
        `create policy.*on public\\.${table} for update.*to authenticated`,
        "s"
      );
      expect(allSql).toMatch(updatePolicy);
    }
  });

  it("does not allow DELETE on application-related tables for anon", () => {
    for (const table of applicationTables) {
      const deleteAnonPolicy = new RegExp(
        `create policy.*on public\\.${table} for delete.*to anon`
      );
      expect(allSql).not.toMatch(deleteAnonPolicy);
    }
  });

  it("allows anonymous SELECT on school_years", () => {
    expect(allSql).toMatch(
      /create policy.*on public\.school_years for select.*to anon/s
    );
  });

  it("allows anonymous SELECT on decision_templates", () => {
    expect(allSql).toMatch(
      /create policy.*on public\.decision_templates for select.*to anon/s
    );
  });

  it("allows authenticated CRUD on school_years", () => {
    for (const op of ["insert", "update", "delete"]) {
      const policy = new RegExp(
        `create policy.*on public\\.school_years for ${op}.*to authenticated`,
        "s"
      );
      expect(allSql).toMatch(policy);
    }
  });

  it("allows authenticated CRUD on decision_templates", () => {
    for (const op of ["insert", "update", "delete"]) {
      const policy = new RegExp(
        `create policy.*on public\\.decision_templates for ${op}.*to authenticated`,
        "s"
      );
      expect(allSql).toMatch(policy);
    }
  });
});

describe("Storage policies", () => {
  const allSql = readAllMigrations();

  it("creates upload policy for anonymous users on pending/*", () => {
    expect(allSql).toMatch(/documents_upload_anon/);
    expect(allSql).toMatch(/storage\.objects for insert.*to anon/s);
    expect(allSql).toMatch(/bucket_id = 'documents'/);
    expect(allSql).toMatch(/pending/);
  });

  it("creates select policy for authenticated users", () => {
    expect(allSql).toMatch(/documents_select_auth/);
    expect(allSql).toMatch(
      /storage\.objects for select.*to authenticated/s
    );
  });

  it("creates update policy for authenticated users", () => {
    expect(allSql).toMatch(/documents_update_auth/);
    expect(allSql).toMatch(
      /storage\.objects for update.*to authenticated/s
    );
  });

  it("creates delete policy for authenticated users", () => {
    expect(allSql).toMatch(/documents_delete_auth/);
    expect(allSql).toMatch(
      /storage\.objects for delete.*to authenticated/s
    );
  });

  it("does not allow anonymous SELECT on storage", () => {
    expect(allSql).not.toMatch(
      /storage\.objects for select.*to anon/s
    );
  });
});

describe("Seed data", () => {
  const seedSql = readFileSync(SEED_FILE, "utf-8");

  it("seeds default approval template", () => {
    expect(seedSql).toContain("'aprovacao'");
    expect(seedSql).toContain("Arca Nossa Senhora da Providência");
    expect(seedSql).toContain("Comissão de Bolsas de Estudo");
    expect(seedSql).toContain("foi APROVADA");
    expect(seedSql).toContain("{nome_pai}");
    expect(seedSql).toContain("{nome_mae}");
    expect(seedSql).toContain("{aluno}");
    expect(seedSql).toContain("{escola}");
    expect(seedSql).toContain("{ano_letivo}");
    expect(seedSql).toContain("{desconto}");
  });

  it("seeds default rejection template", () => {
    expect(seedSql).toContain("'rejeicao'");
    expect(seedSql).toContain("não pôde ser atendida");
    expect(seedSql).toContain(
      "reapresentar a solicitação no próximo período"
    );
  });

  it("seeds sample school year 2026", () => {
    expect(seedSql).toMatch(/insert into public\.school_years/);
    expect(seedSql).toContain("'2026'");
    expect(seedSql).toContain("'2026-06-01'");
    expect(seedSql).toContain("'2026-08-31'");
    expect(seedSql).toContain("true");
  });

  it("uses idempotent inserts", () => {
    expect(seedSql).toContain("on conflict do nothing");
  });
});

describe("Config", () => {
  const config = readFileSync(
    join(__dirname, "../supabase/config.toml"),
    "utf-8"
  );

  it("configures documents storage bucket", () => {
    expect(config).toContain("[storage.buckets.documents]");
    expect(config).toContain("public = false");
    expect(config).toMatch(/file_size_limit.*10MiB/);
    expect(config).toContain("image/png");
    expect(config).toContain("image/jpeg");
    expect(config).toContain("application/pdf");
  });
});
