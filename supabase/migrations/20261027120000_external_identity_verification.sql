-- ============================================================
-- Integrazione Verifica Identità Esterna (Stripe Identity + SPID/CIE)
-- Zero memorizzazione di documenti sensibili sui server proprietari
-- ============================================================

ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_method TEXT 
    CHECK (verification_method IN ('spid', 'cie', 'stripe_identity', 'manual')),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS identity_session_id TEXT;

-- Indice per verificare rapidamente lo stato identità
CREATE INDEX IF NOT EXISTS idx_waitlist_identity_verified 
  ON public.waitlist(identity_verified, verification_method);
