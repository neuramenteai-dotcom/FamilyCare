-- ============================================================
-- Allineamento: colonne identita mancanti
-- ============================================================
-- La migrazione 20260624_identity_verification dichiarava tre colonne
-- (id_front_url, id_back_url, selfie_url) ma sul database di produzione
-- risultava applicata solo id_front_url. Le altre due non sono usate dal
-- codice applicativo, ma vanno create perche lo schema coincida con i file
-- di migrazione: senza questo allineamento il registro dichiarerebbe
-- applicata una migrazione che in realta lo era solo in parte.

ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS id_back_url TEXT,
  ADD COLUMN IF NOT EXISTS selfie_url TEXT;
