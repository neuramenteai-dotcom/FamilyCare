import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getRicercheSalvate,
  creaRicercaSalvata,
  eliminaRicercaSalvata,
} from "@/functions/ricerche.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ServizioKey = "babysitter" | "badanti" | "colf" | "dogsitter" | "tutor";

const SERVIZI: { value: ServizioKey; label: string }[] = [
  { value: "babysitter", label: "Babysitter" },
  { value: "badanti", label: "Assistente familiare" },
  { value: "colf", label: "Colf e pulizie" },
  { value: "dogsitter", label: "Dog sitter" },
  { value: "tutor", label: "Ripetizioni / Tutor" },
];

interface Ricerca {
  id: string;
  nome: string;
  citta: string;
  zona: string | null;
  servizi: string[];
}

export function RicercheSalvate() {
  const carica = useServerFn(getRicercheSalvate);
  const crea = useServerFn(creaRicercaSalvata);
  const elimina = useServerFn(eliminaRicercaSalvata);

  const [abilitata, setAbilitata] = useState(false);
  const [ricerche, setRicerche] = useState<Ricerca[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [apertoForm, setApertoForm] = useState(false);
  const [salvataggio, setSalvataggio] = useState(false);

  const [nome, setNome] = useState("");
  const [citta, setCitta] = useState("");
  const [zona, setZona] = useState("");
  const [servizi, setServizi] = useState<ServizioKey[]>([]);

  const ricarica = useCallback(async () => {
    try {
      const res = await carica();
      if (res.success) {
        setAbilitata(res.abilitata);
        setRicerche((res.ricerche || []) as Ricerca[]);
      }
    } catch {
      // Silenzioso: la sezione è accessoria, non deve rompere la dashboard.
    } finally {
      setCaricamento(false);
    }
  }, [carica]);

  useEffect(() => {
    ricarica();
  }, [ricarica]);

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    setSalvataggio(true);
    try {
      const res = await crea({ data: { nome, citta, zona, servizi } });
      if (res.success) {
        toast.success("Ricerca salvata. Ti avvisiamo quando entra un profilo adatto.");
        setNome("");
        setCitta("");
        setZona("");
        setServizi([]);
        setApertoForm(false);
        ricarica();
      } else {
        toast.error(res.error || "Non siamo riusciti a salvare la ricerca.");
      }
    } catch {
      toast.error("Errore di connessione.");
    } finally {
      setSalvataggio(false);
    }
  }

  async function rimuovi(id: string) {
    try {
      const res = await elimina({ data: { id } });
      if (res.success) {
        setRicerche((r) => r.filter((x) => x.id !== id));
      } else {
        toast.error(res.error || "Non siamo riusciti a eliminare la ricerca.");
      }
    } catch {
      toast.error("Errore di connessione.");
    }
  }

  const toggleServizio = (s: ServizioKey) =>
    setServizi((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));

  if (caricamento || !abilitata) return null;

  return (
    <section className="bg-card border border-border rounded-3xl p-6 md:p-7 mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <div className="flex items-center gap-2.5">
          <Bell className="h-5 w-5 text-primary shrink-0" />
          <h2 className="text-xl font-semibold">Ricerche salvate</h2>
        </div>
        {!apertoForm && (
          <Button
            variant="outline"
            className="rounded-full h-10"
            onClick={() => setApertoForm(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nuova ricerca
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Descrivi cosa cerchi: ti scriviamo per email quando entra un profilo verificato che
        corrisponde. Non devi più tornare a controllare ogni giorno.
      </p>

      {apertoForm && (
        <form onSubmit={salva} className="bg-secondary/40 rounded-2xl p-5 mb-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rs-nome">Come la chiami *</Label>
              <Input
                id="rs-nome"
                required
                minLength={2}
                maxLength={60}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Es. Assistente per mia madre"
                className="h-11 rounded-xl mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="rs-citta">Città *</Label>
              <Input
                id="rs-citta"
                required
                minLength={2}
                maxLength={80}
                value={citta}
                onChange={(e) => setCitta(e.target.value)}
                placeholder="Es. Roma"
                className="h-11 rounded-xl mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rs-zona">Zona (facoltativa)</Label>
            <Input
              id="rs-zona"
              maxLength={100}
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Es. Prati, Monteverde"
              className="h-11 rounded-xl mt-1.5"
            />
          </div>

          <div>
            <Label>Servizi (se non scegli, ti avvisiamo per tutti)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SERVIZI.map((s) => {
                const attivo = servizi.includes(s.value);
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleServizio(s.value)}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                      attivo
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={salvataggio} className="rounded-full h-11">
              {salvataggio && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salva ricerca
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-full h-11"
              onClick={() => setApertoForm(false)}
            >
              Annulla
            </Button>
          </div>
        </form>
      )}

      {ricerche.length === 0 ? (
        !apertoForm && (
          <p className="text-sm text-muted-foreground">Non hai ancora ricerche salvate.</p>
        )
      ) : (
        <ul className="space-y-2.5">
          {ricerche.map((r) => (
            <li
              key={r.id}
              className="flex items-start justify-between gap-4 border border-border rounded-2xl p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">{r.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {r.citta}
                  {r.zona ? `, ${r.zona}` : ""}
                  {r.servizi.length > 0
                    ? ` · ${r.servizi
                        .map((s) => SERVIZI.find((x) => x.value === s)?.label ?? s)
                        .join(", ")}`
                    : " · tutti i servizi"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => rimuovi(r.id)}
                aria-label={`Elimina la ricerca ${r.nome}`}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1.5"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
