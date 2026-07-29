import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getConciergeSelections } from "@/functions/concierge.functions";
import { Sparkles, UserRound } from "lucide-react";

type Selection = {
  id: string;
  notes: string | null;
  full_name: string | null;
  city: string | null;
  experience: string | null;
  nationality: string | null;
  services: string[] | null;
  bio: string | null;
  avatar_url: string | null;
};

// Sezione "Selezionati per te" — visibile solo alle famiglie Premium con profili
// presentati dal servizio concierge. Si nasconde da sola se non ci sono selezioni.
export function ConciergeSection() {
  const fetchSelections = useServerFn(getConciergeSelections);
  const [selections, setSelections] = useState<Selection[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchSelections().then((res) => {
      if (!cancelled && res.success && res.enabled) {
        setSelections((res.selections as Selection[]) || []);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchSelections]);

  if (selections.length === 0) return null;

  return (
    <div className="mb-10 rounded-3xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Selezionati per te</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Il nostro team ha esaminato i profili disponibili e ha scelto per te i più adatti alle tue
        esigenze.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {selections.map((s) => (
          <div
            key={s.id}
            className="bg-background rounded-2xl border border-border/60 p-6 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-muted grid place-items-center shrink-0">
                {s.avatar_url ? (
                  <img src={s.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserRound className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{s.full_name || "Professionista"}</h3>
                <p className="text-sm text-muted-foreground">{s.city || "—"}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {s.experience && <div>Esperienza: {s.experience}</div>}
              {s.nationality && <div>Nazionalità: {s.nationality}</div>}
              {s.services && s.services.length > 0 && <div>Servizi: {s.services.join(", ")}</div>}
            </div>
            {s.notes && (
              <div className="mt-3 p-3 rounded-xl bg-primary/10 text-sm">
                <span className="font-medium text-primary">Perché l'abbiamo scelto: </span>
                <span className="text-foreground">{s.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
