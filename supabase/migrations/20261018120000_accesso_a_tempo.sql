-- ============================================================
-- Accesso a tempo al posto dell'abbonamento ricorrente
-- ============================================================
-- La famiglia cerca, trova e smette: resta uno o due mesi, non anni. Un
-- abbonamento ricorrente su quell'uso produce disdette dimenticate e
-- rimborsi. La fonte di verita' dell'accesso diventa quindi una data di
-- scadenza, non lo stato di un abbonamento Stripe.

ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.waitlist.access_expires_at IS
  'Scadenza dell''accesso acquistato dalla famiglia. NULL = nessun accesso attivo.';

CREATE INDEX IF NOT EXISTS idx_waitlist_access_expires
  ON public.waitlist(access_expires_at)
  WHERE access_expires_at IS NOT NULL;

-- Il livello "premium" non e' piu' in vendita: il concierge, che ne era la
-- ragione, costituiva selezione attiva di personale per conto del cliente e
-- avvicinava l'attivita' all'intermediazione di manodopera. Il vincolo su
-- plan_tier resta permissivo per non invalidare eventuali righe storiche.
