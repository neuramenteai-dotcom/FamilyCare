import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/recupera-password")({
  component: RecuperaPasswordPage,
});

function RecuperaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/aggiorna-password",
    });

    if (error) {
      toast.error("Errore durante l'invio dell'email. Riprova.");
    } else {
      setSent(true);
      toast.success("Ti abbiamo inviato un'email con le istruzioni!");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md bg-background rounded-3xl shadow-xl p-8 border border-border/40 text-center">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <MailCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Controlla la tua email</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Ti abbiamo inviato un link magico per reimpostare la tua password all'indirizzo <strong>{email}</strong>.
            Se non la trovi, controlla nello Spam.
          </p>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl">
            <Link to="/login">Torna al login</Link>
          </Button>
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
        <h1 className="text-2xl font-semibold text-center mb-2">Recupera password</h1>
        <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
          Inserisci l'email associata al tuo account. Ti invieremo un link per creare una nuova password.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@email.it"
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-base shadow-soft"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Invia link di recupero"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al login
          </Link>
        </div>
      </div>
    </div>
  );
}
