-- Seed: Default decision templates and sample school year

-- Default approval template
insert into public.decision_templates (tipo, cabecalho, corpo, rodape)
values (
  'aprovacao',
  E'Arca Nossa Senhora da Providência\nComissão de Bolsas de Estudo',
  E'Prezado(a) Sr(a). {nome_pai} e Sra. {nome_mae},\n\nTemos a satisfação de comunicar que a solicitação de bolsa de estudo para o(a) aluno(a) {aluno}, na escola {escola}, foi APROVADA para o ano letivo de {ano_letivo}.\n\nFoi concedido um desconto de {desconto}% sobre o valor da mensalidade.\n\n{motivo}\n\nSolicitamos que compareçam à secretaria da escola para formalizar a matrícula.',
  E'Atenciosamente,\nComissão de Bolsas — Arca N. S. da Providência\n{data}'
)
on conflict do nothing;

-- Default rejection template
insert into public.decision_templates (tipo, cabecalho, corpo, rodape)
values (
  'rejeicao',
  E'Arca Nossa Senhora da Providência\nComissão de Bolsas de Estudo',
  E'Prezado(a) Sr(a). {nome_pai} e Sra. {nome_mae},\n\nApós análise cuidadosa, informamos que a solicitação de bolsa de estudo para o(a) aluno(a) {aluno}, na escola {escola}, não pôde ser atendida para o ano letivo de {ano_letivo}.\n\n{motivo}\n\nA família poderá reapresentar a solicitação no próximo período de inscrições.',
  E'Atenciosamente,\nComissão de Bolsas — Arca N. S. da Providência\n{data}'
)
on conflict do nothing;

-- Sample school year (2026)
insert into public.school_years (nome, data_inicio, data_fim, ativo)
values ('2026', '2026-06-01', '2026-08-31', true)
on conflict do nothing;
