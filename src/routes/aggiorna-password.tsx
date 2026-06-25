import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/aggiorna-password")({
  component: AggiornaPasswordPage,
});

function AggiornaPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Check if we actually have a session or recovery token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If there's no session, they might have accessed this page directly without a valid token.
        // But we wait a moment since Supabase processes the hash on load.
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            toast.error("Il link di recupero è non valido o scaduto.");
            navigate({ to: "/login" });
          }
        }, 1000);
      }
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Errore durante l'aggiornamento della password: " + error.message);
      setLoading(false);
    } else {
      setDone(true);
      toast.success("Password aggiornata con successo!");
      setLoading(false);
      
      // Navigate to dashboard based on role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setTimeout(() => {
          const userType = user.user_metadata?.user_type;
          if (userType === "famiglia") navigate({ to: "/famiglia/dashboard" });
          else if (userType === "professionista") navigate({ to: "/professionista/dashboard" });
          else navigate({ to: "/admin" });
        }, 2000);
      }
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md bg-background rounded-3xl shadow-xl p-8 border border-border/40 text-center">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <ArrowRight className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Tutto pronto!</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            La tua password è stata aggiornata con successo. Ti stiamo reindirizzando alla tua dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-background rounded-3xl shadow-xl p-8 border border-border/40">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-2xl font-semibold text-center mb-2">Imposta nuova password</h1>
        <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
          Crea una nuova password per il tuo account. Usa almeno 6 caratteri.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Nuova Password</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caratteri"
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-base shadow-soft"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Aggiorna password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
