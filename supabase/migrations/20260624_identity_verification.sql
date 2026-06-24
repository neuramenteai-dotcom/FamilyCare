-- 1. Aggiungi le colonne per i documenti alla tabella waitlist
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS id_front_url TEXT,
ADD COLUMN IF NOT EXISTS id_back_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT;

-- 2. Crea il bucket per i documenti (se non esiste)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identity_docs', 'identity_docs', false)
ON CONFLICT (id) DO NOTHING;
