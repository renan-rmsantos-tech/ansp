-- Corrige registros cujo arquivo já foi movido para applications/{id}/,
-- mas storage_path ainda aponta para pending/{uuid}/.
update public.documents
set storage_path = 'applications/' || application_id::text || '/' ||
  substring(storage_path from '^pending/[^/]+/(.+)$')
where storage_path like 'pending/%'
  and substring(storage_path from '^pending/[^/]+/(.+)$') is not null;
