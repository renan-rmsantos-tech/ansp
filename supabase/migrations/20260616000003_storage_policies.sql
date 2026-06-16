-- Migration: Storage bucket policies for 'documents'
-- The bucket itself is created via config.toml [storage.buckets.documents]
-- This migration adds RLS policies for upload/download access.

-- Anonymous users can upload to pending/* paths
create policy "documents_upload_anon"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'pending'
  );

-- Authenticated users can read/download all documents
create policy "documents_select_auth"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents');

-- Authenticated users can update (move) documents
create policy "documents_update_auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');

-- Authenticated users can delete documents
create policy "documents_delete_auth"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents');
