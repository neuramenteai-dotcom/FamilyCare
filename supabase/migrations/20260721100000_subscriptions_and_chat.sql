-- ============================================================
-- Fase 1 — Abbonamenti a livelli, campi profilo, contatti e chat
-- Idempotente dove possibile.
-- ============================================================

-- 1) Colonne abbonamento sulla tabella waitlist (famiglie)
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS plan_tier TEXT
    CHECK (plan_tier IN ('base', 'plus', 'premium')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT
    CHECK (subscription_status IN ('active', 'past_due', 'canceled')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_current_period_end TIMESTAMPTZ;

-- 2) Nuovi campi profilo professionista
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS criminal_check_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS references_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificates_verified BOOLEAN NOT NULL DEFAULT false;

-- 3) Contatti Famiglia -> Professionista (limiti per tier gestiti lato server)
CREATE TABLE IF NOT EXISTS public.family_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, professional_id)
);
CREATE INDEX IF NOT EXISTS idx_family_contacts_family ON public.family_contacts(family_id);
-- Accesso solo via service role (server functions); RLS attiva senza policy permissive.
ALTER TABLE public.family_contacts ENABLE ROW LEVEL SECURITY;

-- 4) Conversazioni e messaggi (chat)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, professional_id)
);
CREATE INDEX IF NOT EXISTS idx_conversations_family ON public.conversations(family_id);
CREATE INDEX IF NOT EXISTS idx_conversations_professional ON public.conversations(professional_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_auth_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at);

-- RLS: solo i due partecipanti (via waitlist.auth_id = auth.uid()) possono leggere.
-- L'invio passa da una server function (service role), quindi non servono policy di INSERT dal browser.
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.waitlist w
      WHERE w.auth_id = auth.uid()
        AND w.id IN (conversations.family_id, conversations.professional_id)
    )
  );

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.waitlist w
        ON w.id IN (c.family_id, c.professional_id)
      WHERE c.id = messages.conversation_id
        AND w.auth_id = auth.uid()
    )
  );

-- 5) Realtime sui messaggi (ricezione live nel browser, filtrata da RLS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END$$;
