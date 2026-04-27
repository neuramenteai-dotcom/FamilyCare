
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  user_type text NOT NULL DEFAULT 'famiglia' CHECK (user_type IN ('famiglia','professionista')),
  city text,
  message text,
  source text NOT NULL DEFAULT 'waitlist' CHECK (source IN ('waitlist','contact')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_email_source_idx ON public.waitlist (lower(email), source);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Public can insert (waitlist signup / contact form), but no one can read from client.
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
