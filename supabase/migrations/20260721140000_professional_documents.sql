-- ============================================================
-- Fase 3 — Verifica approfondita professionisti (documenti + badge)
-- I documenti (casellario, referenze, attestati) sono privati; le famiglie
-- vedono SOLO i badge *_verified sulla tabella waitlist (impostati dall'admin).
-- ============================================================

-- Tabella documenti di verifica del professionista
CREATE TABLE IF NOT EXISTS public.professional_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('casellario', 'referenza', 'attestato')),
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pro_documents_professional
  ON public.professional_documents(professional_id);

-- Accesso solo via service role (server functions). RLS attiva senza policy permissive.
ALTER TABLE public.professional_documents ENABLE ROW LEVEL SECURITY;

-- Bucket privato per i documenti di verifica
INSERT INTO storage.buckets (id, name, public)
VALUES ('pro_documents', 'pro_documents', false)
ON CONFLICT (id) DO NOTHING;
