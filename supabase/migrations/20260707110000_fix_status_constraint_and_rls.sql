-- 1. Il constraint su status non includeva 'pre_approvato', valore che
--    l'app scrive dopo la verifica AI del documento: l'UPDATE falliva.
ALTER TABLE public.waitlist
  DROP CONSTRAINT IF EXISTS waitlist_status_check;

ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_status_check
  CHECK (status IN ('nuovo', 'contattato', 'in_verifica', 'pre_approvato', 'attivo'));

-- 2. La policy "Enable all for service role" era USING (true) senza
--    restrizione di ruolo o comando: concedeva accesso completo a tutti.
--    Il service role bypassa comunque la RLS, quindi nessuna policy è
--    necessaria: RLS resta attiva e blocca ogni accesso diretto dal client.
DROP POLICY IF EXISTS "Enable all for service role" ON public.professional_interests;
