-- Fix constraint on 'source' column to accept all form sources used by the frontend
ALTER TABLE public.waitlist DROP CONSTRAINT IF EXISTS waitlist_source_check;
ALTER TABLE public.waitlist ADD CONSTRAINT waitlist_source_check 
  CHECK (source IN ('waitlist', 'contact', 'famiglia_form', 'pro_form'));
