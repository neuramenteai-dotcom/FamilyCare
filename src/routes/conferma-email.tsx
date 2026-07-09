import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/functions/dashboard.functions";
import { Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/conferma-email")({
  component: ConfermaEmailPage,
});

// Landing del link di conferma email (double opt-in). Supabase, con
// detectSessionInUrl, stabilisce la sessione dal token nell'URL; qui
// instradiamo l'utente in base al tipo di profilo.
function ConfermaEmailPage() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      // Supabase elabora l'hash dell'URL in modo asincrono al load.
      // Attendiamo brevemente che la sessione sia disponibile.
      let session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        await new Promise((r) => setTimeout(r, 1200));
        session = (await supabase.auth.getSession()).data.session;
      }

      if (cancelled) return;

      if (!session) {
        setError(true);
        return;
      }

      const res = await fetchProfile();
      if (cancelled) return;

      if (res.success && res.profile) {
        if (res.profile.user_type === "professionista") {
          navigate({ to: "/verifica-identita/$id", params: { id: res.profile.id } });
        } else {
          navigate({ to: "/famiglia/dashboard" });
        }
      } else {
        // Sessione valida ma profilo non trovato: manda comunque all'area giusta.
        navigate({ to: "/famiglia/dashboard" });
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [navigate, fetchProfile]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-background rounded-3xl shadow-xl p-8 border border-border/40 text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        {error ? (
          <>
            <div className="mx-auto h-14 w-14 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-5">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Link non valido o scaduto</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Il link di conferma non è più valido. Prova ad accedere: se l'email non è ancora
              confermata potrai richiedere un nuovo invio.
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Vai al login
            </a>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-5" />
            <h1 className="text-2xl font-semibold mb-2">Conferma in corso…</h1>
            <p className="text-sm text-muted-foreground">
              Stiamo attivando il tuo account. Un attimo di pazienza.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
