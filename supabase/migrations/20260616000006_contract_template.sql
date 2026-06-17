-- Migration: Modelo (template) do Contrato de Concessão de Bolsa de Estudos.
-- Estrutura em seções editáveis: cabeçalho, cláusulas (array) e rodapé.
-- O contrato é preenchido com os dados de cada solicitação aprovada e
-- exportado em PDF. Espera-se uma única linha (singleton).

create table public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default 'CONTRATO DE CONCESSÃO DE BOLSA DE ESTUDOS',
  cabecalho text not null default '',
  -- [{ "titulo": "...", "corpo": "..." }, ...]
  clausulas jsonb not null default '[]'::jsonb,
  rodape text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.contract_templates enable row level security;

-- contract_templates: anon SELECT, auth full CRUD (mesmo padrão de decision_templates)
create policy "contract_templates_select_public"
  on public.contract_templates for select
  to anon, authenticated
  using (true);

create policy "contract_templates_insert_auth"
  on public.contract_templates for insert
  to authenticated
  with check (true);

create policy "contract_templates_update_auth"
  on public.contract_templates for update
  to authenticated
  using (true)
  with check (true);

create policy "contract_templates_delete_auth"
  on public.contract_templates for delete
  to authenticated
  using (true);

-- Modelo padrão a partir de docs/contrato_adesao.docx, com [campos] -> {tokens}.
insert into public.contract_templates (titulo, cabecalho, clausulas, rodape)
values (
  'CONTRATO DE CONCESSÃO DE BOLSA DE ESTUDOS',
  E'PARTES\n\nCONCEDENTE: Arca Nossa Senhora da Providência, civilmente registrada como ACIPEC ASSOCIACAO CIVIL PARA EDUCACAO CATOLICA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 42.736.079/0001-63, com sede na Rua Maurício F. Klabin, 223, Vila Mariana, na Capital do Estado de São Paulo, CEP 04120-020, neste ato representada por seu representante legal.\n\nBENEFICIÁRIO: {aluno}, menor impúbere/púbere, neste ato representado(a) por seu Responsável Legal, {nome_responsavel}, portador(a) do RG nº {rg_responsavel} e inscrito(a) no CPF sob o nº {cpf_responsavel}, residente e domiciliado(a) em {endereco}.',
  $json$[
    {
      "titulo": "CLÁUSULA PRIMEIRA – DO OBJETO E DO PERCENTUAL DA BOLSA",
      "corpo": "1.1. O presente contrato tem por objeto a concessão de uma bolsa de estudos para o ano letivo de {ano_letivo}, destinada ao custeio parcial ou integral das mensalidades escolares do Beneficiário.\n1.2. Fica estabelecido que o percentual concedido a título de bolsa de estudos será de {desconto}% do valor da mensalidade escolar da série em que o aluno estiver devidamente matriculado."
    },
    {
      "titulo": "CLÁUSULA SEGUNDA – DO DESTINO DOS RECURSOS E ESCOLAS FILIADAS",
      "corpo": "2.1. O repasse financeiro correspondente ao percentual da bolsa será efetuado diretamente à instituição de ensino, mediante faturamento ou repasse interno, não sendo, em hipótese alguma, entregue em dinheiro ou espécie ao Beneficiário ou ao seu Responsável Legal.\n2.2. Restrição de Rede: O pagamento e o benefício previstos neste contrato são válidos exclusivamente para instituições de ensino devidamente filiadas à Concedente (Arca Nossa Senhora da Providência). Caso o Beneficiário seja transferido para uma escola não filiada, o presente contrato será rescindido automaticamente, cessando o direito à bolsa."
    },
    {
      "titulo": "CLÁUSULA TERCEIRA – DO PRAZO DE VIGÊNCIA",
      "corpo": "3.1. A presente bolsa de estudos é concedida pelo prazo determinado de 1 (um) ano letivo, iniciando-se em {data_inicio} e encerrando-se em {data_termino}, sem qualquer garantia ou obrigatoriedade de renovação automática para os anos subsequentes."
    },
    {
      "titulo": "CLÁUSULA QUARTA – DA PERDA DA BOLSA POR FALTA GRAVE",
      "corpo": "4.1. O Beneficiário poderá perder o direito à bolsa de estudos a qualquer momento, de forma imediata, caso cometa uma falta grave, conforme os critérios estabelecidos no Regimento Interno da escola ou pela legislação vigente.\n4.2. Para fins deste contrato, consideram-se faltas graves, entre outras: atos de indisciplina reiterada, violência física ou verbal; danos intencionais ao patrimônio da escola; desrespeito grave aos professores, funcionários ou colegas; frequência escolar inferior à exigida por lei (75%), salvo justificativa médica comprovada; desempenho acadêmico manifestamente insuficiente por desinteresse manifesto do aluno; ou qualquer falta grave ao regulamento interno da instituição de ensino.\n4.3. A ocorrência da falta grave será apurada pela direção da escola filiada e comunicada à Concedente, que notificará o Responsável Legal sobre o cancelamento imediato do benefício."
    },
    {
      "titulo": "CLÁUSULA QUINTA – DO FORO",
      "corpo": "5.1. Para dirimir quaisquer dúvidas decorrentes deste instrumento, as partes elegem o foro da comarca de Itatiba - SP, com renúncia expressa a qualquer outro."
    }
  ]$json$::jsonb,
  E'Por estarem assim justos e contratados, assinam o presente instrumento em 2 (duas) vias de igual teor.\n\n{data_extenso}\n\n\n_____________________________________________\nArca Nossa Senhora da Providência — Concedente\n\n\n_____________________________________________\n{nome_responsavel} — Responsável pelo Beneficiário'
)
on conflict do nothing;
