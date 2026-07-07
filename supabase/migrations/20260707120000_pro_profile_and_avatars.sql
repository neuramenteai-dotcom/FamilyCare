-- Versione idempotente dello script phase2_migration.sql (già applicato
-- manualmente in produzione): profilo esteso professionista + bucket avatars.

-- Aggiunta colonne alla tabella waitlist per il profilo esteso del professionista
ALTER TABLE public.waitlist
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Creazione del bucket Storage 'avatars' (se non esiste)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy per permettere a tutti (anche anonimi) di visualizzare le foto profilo
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Policy per permettere agli utenti autenticati di caricare le proprie foto
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Policy per permettere agli utenti di aggiornare le proprie foto
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);
