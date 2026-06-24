ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'nuovo' CHECK (status IN ('nuovo', 'contattato', 'in_verifica', 'attivo')),
  ADD COLUMN IF NOT EXISTS score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100);
