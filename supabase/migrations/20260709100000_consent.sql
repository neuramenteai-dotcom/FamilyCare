-- Consenso provabile (GDPR art. 7). Registra accettazione privacy/termini,
-- consenso marketing separato e la versione dei documenti accettata.
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_policy_version TEXT;
