import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { joinWaitlist } from "@/server/waitlist.functions";
import { toast } from "sonner";

export function WaitlistForm({ variant = "default" }: { variant?: "default" | "compact" }) {
  const join = useServerFn(joinWaitlist);
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"famiglia" | "professionista">("famiglia");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await join({ data: { email, userType, city, source: "waitlist" } });
      if (res.success) {
        setDone(true);
        toast.success("Sei nella waitlist! Ti contatteremo al lancio.");
      } else {
        toast.error(res.error || "Qualcosa è andato storto");
      }
    } catch {
      toast.error("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-primary-soft border border-primary/20 p-6 text-center">
        <div className="mx-auto h-12 w-12 grid place-items-center rounded-full bg-primary text-primary-foreground mb-3">
          <Check className="h-6 w-6" strokeWidth={3} />
        </div>
        <p className="font-display text-xl font-semibold">Iscrizione confermata!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Ti scriviamo appena CareTinder è disponibile nella tua città.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={variant === "compact" ? "space-y-3" : "space-y-4"}>
      <div className="flex gap-2 p-1 bg-muted rounded-full text-sm">
        {(["famiglia", "professionista"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setUserType(t)}
            className={`flex-1 py-2 rounded-full font-medium transition-colors capitalize ${
              userType === t
                ? "bg-background text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sono una {t === "famiglia" ? "famiglia" : "professionista"}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          type="email"
          required
          placeholder="La tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl"
        />
        <Input
          type="text"
          placeholder="Città (es. Milano)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-12 rounded-xl"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-soft"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entra nella waitlist gratis"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Niente spam. Solo un'email quando lanciamo nella tua città.
      </p>
    </form>
  );
}
