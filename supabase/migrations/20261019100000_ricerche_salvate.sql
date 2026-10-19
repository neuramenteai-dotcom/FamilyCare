-- ============================================================
-- Ricerche salvate con avviso
-- ============================================================
-- Sostituiscono il concierge senza farne il lavoro. Il concierge
-- selezionava profili per conto della famiglia, il che costituisce
-- selezione di personale; qui la famiglia descrive da se' cosa cerca e
-- riceve un'email quando entra un profilo che combacia. A scegliere resta
-- sempre la famiglia.
--
-- L'avviso parte nel momento in cui un professionista viene approvato da
-- una persona e diventa visibile: non esiste un canale che anticipi la
-- pubblicazione.

CREATE TABLE IF NOT EXISTS public.ricerche_salvate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  citta TEXT NOT NULL,
  zona TEXT,
  servizi TEXT[] NOT NULL DEFAULT '{}',
  attiva BOOLEAN NOT NULL DEFAULT true,
  ultima_notifica_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ricerche_family ON public.ricerche_salvate(family_id);
CREATE INDEX IF NOT EXISTS idx_ricerche_attive ON public.ricerche_salvate(citta) WHERE attiva;

-- Accesso solo via service role (funzioni server), come le altre tabelle:
-- RLS attiva senza policy permissive.
ALTER TABLE public.ricerche_salvate ENABLE ROW LEVEL SECURITY;
