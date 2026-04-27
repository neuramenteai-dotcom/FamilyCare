ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS services text[],
  ADD COLUMN IF NOT EXISTS frequency text,
  ADD COLUMN IF NOT EXISTS urgency text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS italian_level text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS birth_date date;