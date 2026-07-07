import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  component: AccediPage,
});

function AccediPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Credenziali non valide.");
      setLoading(false);
      return;
    }

    if (data.user) {
      const userType = data.user.user_metadata?.user_type;
      const isAdmin = data.user.app_metadata?.role === "admin";
      if (isAdmin) {
        navigate({ to: "/admin" });
      } else if (userType === "professionista") {
        navigate({ to: "/professionista/dashboard" });
      } else {
        navigate({ to: "/famiglia/dashboard" });
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-background rounded-3xl shadow-xl p-8 border border-border/40">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-2xl font-semibold text-center mb-2">Bentornato</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Accedi alla tua area riservata
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              <Link to="/recupera-password" className="text-sm font-medium text-primary hover:underline">
                Hai dimenticato la password?
              </Link>
            </div>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="La tua password"
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-base"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Accedi"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Non hai ancora un account?{" "}
          <Link to="/" className="text-primary hover:underline font-medium">
            Iscriviti gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
