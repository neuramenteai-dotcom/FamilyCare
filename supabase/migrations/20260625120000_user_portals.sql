-- Aggiungi colonne per il sistema di login degli utenti e pacchetti famiglia
ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS has_active_package BOOLEAN DEFAULT false;

-- Crea indice per velocizzare la ricerca per auth_id
CREATE INDEX IF NOT EXISTS idx_waitlist_auth_id ON waitlist(auth_id);

-- Creazione tabella per le preferenze (Likes/Dislikes) dei professionisti verso le famiglie
CREATE TABLE IF NOT EXISTS professional_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES waitlist(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES waitlist(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un professionista può esprimere un solo interesse (like o dislike) per una specifica famiglia
  UNIQUE(professional_id, family_id)
);

-- Sicurezza (RLS) - Permettiamo lettura/scrittura in base alle policy
ALTER TABLE professional_interests ENABLE ROW LEVEL SECURITY;

-- Policy per consentire tutto via Service Role (il client userà il server o RLS configurato dopo)
CREATE POLICY "Enable all for service role" ON professional_interests USING (true);
