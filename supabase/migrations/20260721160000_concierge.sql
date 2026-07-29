-- ============================================================
-- Fase 4 — Concierge Premium
-- Per una famiglia Premium, l'admin cura una rosa di profili e ne "presenta"
-- i migliori. La famiglia vede solo i profili con presented = true.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.concierge_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
  presented BOOLEAN NOT NULL DEFAULT false,
  rank INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, professional_id)
);
CREATE INDEX IF NOT EXISTS idx_concierge_family ON public.concierge_selections(family_id);

-- Accesso solo via service role (server functions). RLS attiva senza policy permissive.
ALTER TABLE public.concierge_selections ENABLE ROW LEVEL SECURITY;
