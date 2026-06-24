import { useState, useEffect } from "react";
import { Calculator, Coins, ShieldCheck, TrendingUp, Landmark, Award } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const LIVEL_RATES: Record<string, { label: string; rate: number; desc: string }> = {
  A: { label: "Livello A (Collaboratori generici senza esperienza)", rate: 6.00, desc: "Addetti a pulizie, lavanderia, aiuto domestico." },
  AS: { label: "Livello AS (Baby Sitter occasionale / Compagnia)", rate: 7.00, desc: "Solo compagnia o vigilanza di persone autosufficienti." },
  B: { label: "Livello B (Collaboratori con esperienza)", rate: 7.20, desc: "Camerieri, cuochi, colf esperte, custodi." },
  BS: { label: "Livello BS (Baby Sitter / Assistenza a autosufficienti)", rate: 7.80, desc: "Baby sitter standard o assistenza a anziani autosufficienti." },
  C: { label: "Livello C (Cuochi o assistenti specializzati)", rate: 8.40, desc: "Preparazione pasti avanzata, gestione casa." },
  CS: { label: "Livello CS (Assistenti a non autosufficienti - non formati)", rate: 9.00, desc: "Accudimento di persone non autosufficienti (collaboratrici domestiche standard)." },
  D: { label: "Livello D (Profili gestionali o infermieristici)", rate: 10.20, desc: "Educatori, governanti, chef domestici." },
  DS: { label: "Livello DS (Assistenti a non autosufficienti - formati)", rate: 11.50, desc: "Infermieri, collaboratrici domestiche con certificazione professionale riconosciuta." },
};

const SERVICE_RATES: Record<string, { label: string; rate: number }> = {
  babysitter: { label: "Babysitter", rate: 9.00 },
  badanti: { label: "Collaboratrice domestica / Assistente familiare", rate: 9.50 },
  colf: { label: "Colf e pulizie", rate: 10.00 },
  dogsitter: { label: "Dog sitter", rate: 8.00 },
  tutor: { label: "Ripetizioni / Tutor scolastico", rate: 13.00 },
};

const CITY_MULTIPLIERS: Record<string, number> = {
  Roma: 0.15,
  Milano: 0.15,
  Torino: 0.05,
  Napoli: -0.05,
  Bologna: 0.08,
  Firenze: 0.05,
  Genova: 0.02,
  Palermo: -0.08,
  Bari: -0.05,
  "Altra città": 0.00,
};

export function UnifiedSimulator() {
  const [activeTab, setActiveTab] = useState<"famiglia" | "lavoratore">("famiglia");

  return (
    <div id="simulatore" className="w-full max-w-4xl mx-auto bg-card border border-border rounded-3xl overflow-hidden shadow-soft">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:p-8 text-center border-b border-border">
        <h3 className="font-display text-3xl font-semibold text-foreground">Calcolatore Economico FamilyCare</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
          Calcola in pochi secondi il costo totale in regola (CCNL 2026) per la tua famiglia o stima il tuo potenziale guadagno come lavoratore.
        </p>

        {/* Tab Selection */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex p-1.5 bg-muted rounded-2xl border border-border shadow-inner">
            <button
              onClick={() => setActiveTab("famiglia")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "famiglia"
                  ? "bg-background text-primary shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calculator className="h-4 w-4" />
              Per le Famiglie (Costo)
            </button>
            <button
              onClick={() => setActiveTab("lavoratore")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "lavoratore"
                  ? "bg-background text-accent shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Coins className="h-4 w-4" />
              Per i Lavoratori (Guadagno)
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "famiglia" ? <FamilyCostSimulator /> : <ProIncomeSimulator />}
      </div>
    </div>
  );
}

function FamilyCostSimulator() {
  const [ore, setOre] = useState<number>(30);
  const [livello, setLivello] = useState<string>("BS");
  const [customPaga, setCustomPaga] = useState<string>("");

  const minRate = LIVEL_RATES[livello]?.rate || 7.00;
  const pagaOraria = customPaga !== "" && !isNaN(parseFloat(customPaga)) ? parseFloat(customPaga) : minRate;

  // Calculations
  const oreMensili = (ore * 52) / 12;
  const stipendioNetto = oreMensili * pagaOraria;
  
  // INPS (approx. 22% on average of gross/net for employer contributions)
  const inps = stipendioNetto * 0.22;
  
  // Ratei (13a, TFR, Accrued Holidays ~ 26% of net)
  const ratei = stipendioNetto * 0.26;
  
  const costoMensileTotale = stipendioNetto + inps + ratei;

  // Reset custom wage if level changes
  useEffect(() => {
    setCustomPaga("");
  }, [livello]);

  return (
    <div className="grid md:grid-cols-12 gap-8 items-start">
      {/* Inputs */}
      <div className="md:col-span-7 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold text-foreground">Ore di lavoro settimanali: <span className="text-primary font-bold text-lg">{ore} ore</span></Label>
          </div>
          <input
            type="range"
            min="5"
            max="54"
            step="1"
            value={ore}
            onChange={(e) => setOre(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 ore (minimo)</span>
            <span>25 ore (Part-time)</span>
            <span>40 ore (Full-time)</span>
            <span>54 ore (Convivente max)</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inquadramento CCNL</Label>
            <Select value={livello} onValueChange={setLivello}>
              <SelectTrigger className="h-11 rounded-xl bg-background border border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LIVEL_RATES).map(([key, item]) => (
                  <SelectItem key={key} value={key}>
                    {item.label} (Min. €{item.rate.toFixed(2)}/h)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paga oraria personalizzata (€/ora)</Label>
            <input
              type="number"
              value={customPaga}
              onChange={(e) => setCustomPaga(e.target.value)}
              placeholder={`Minimo: €${minRate.toFixed(2)}`}
              className="w-full h-11 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary/50 text-sm font-medium"
              min={minRate}
              step="0.10"
            />
          </div>
        </div>

        <div className="p-4 bg-muted/50 border border-border rounded-2xl flex gap-3.5 items-start">
          <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground">{LIVEL_RATES[livello]?.label}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {LIVEL_RATES[livello]?.desc} La nostra piattaforma seleziona profili referenziati corrispondenti esattamente a questo inquadramento.
            </p>
          </div>
        </div>
      </div>

      {/* Output Card */}
      <div className="md:col-span-5 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground p-6 md:p-7 rounded-2xl shadow-card space-y-5">
        <h4 className="font-display text-xl font-bold border-b border-primary-foreground/10 pb-3 flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          Prospetto Costo Mensile
        </h4>

        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between items-center opacity-90">
            <span>Stipendio Netto Lavoratore:</span>
            <span className="font-semibold">€ {stipendioNetto.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center opacity-90">
            <span>Contributi INPS (Datore):</span>
            <span className="font-semibold">€ {inps.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center opacity-90">
            <span>Accantonamento Ratei (TFR/13ª):</span>
            <span className="font-semibold">€ {ratei.toFixed(2)}</span>
          </div>
          <div className="border-t border-primary-foreground/20 pt-4 flex justify-between items-end">
            <div>
              <span className="block text-xs uppercase tracking-wider opacity-70">Costo Stima Totale</span>
              <span className="text-2xl font-bold font-display">€ {costoMensileTotale.toFixed(2)}</span>
            </div>
            <span className="text-[10px] opacity-70 bg-black/20 px-2 py-1 rounded-full">Al mese</span>
          </div>
        </div>

        <div className="bg-white/10 p-3.5 rounded-xl space-y-2 text-xs">
          <div className="flex gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent-foreground" />
            <p className="leading-tight">Gestione Buste Paga ed INPS inclusa nei nostri servizi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProIncomeSimulator() {
  const [ore, setOre] = useState<number>(30);
  const [servizio, setServizio] = useState<string>("badanti");
  const [citta, setCitta] = useState<string>("Roma");

  const baseRate = SERVICE_RATES[servizio]?.rate || 9.00;
  const multiplier = CITY_MULTIPLIERS[citta] || 0.00;
  const finalRate = baseRate * (1 + multiplier);

  const oreMensili = (ore * 52) / 12;
  const guadagnoMensile = oreMensili * finalRate;

  // Benefits
  const tfrStima = guadagnoMensile * 0.083; // approx 1/12th
  const tredicesimaStima = guadagnoMensile * 0.083; 

  return (
    <div className="grid md:grid-cols-12 gap-8 items-start">
      {/* Inputs */}
      <div className="md:col-span-7 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold text-foreground">Ore di disponibilità: <span className="text-accent font-bold text-lg">{ore} ore / settimana</span></Label>
          </div>
          <input
            type="range"
            min="5"
            max="54"
            step="1"
            value={ore}
            onChange={(e) => setOre(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 ore</span>
            <span>20 ore (Part-time)</span>
            <span>40 ore (Tempo pieno)</span>
            <span>54 ore (Massimo)</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo di Servizio</Label>
            <Select value={servizio} onValueChange={setServizio}>
              <SelectTrigger className="h-11 rounded-xl bg-background border border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SERVICE_RATES).map(([key, item]) => (
                  <SelectItem key={key} value={key}>
                    {item.label} (Base: €{item.rate.toFixed(2)}/h)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Città di Lavoro</Label>
            <Select value={citta} onValueChange={setCitta}>
              <SelectTrigger className="h-11 rounded-xl bg-background border border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CITY_MULTIPLIERS).map((city) => (
                  <SelectItem key={city} value={city}>
                    {city} {CITY_MULTIPLIERS[city] > 0 ? `(+${Math.round(CITY_MULTIPLIERS[city]*100)}%)` : CITY_MULTIPLIERS[city] < 0 ? `(${Math.round(CITY_MULTIPLIERS[city]*100)}%)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 bg-muted/50 border border-border rounded-2xl flex gap-3.5 items-start">
          <TrendingUp className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground">Adeguamento tariffe locali</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              La tariffa oraria stimata di **€ {finalRate.toFixed(2)} / ora** include il moltiplicatore locale per **{citta}** legato al costo medio della vita.
            </p>
          </div>
        </div>
      </div>

      {/* Output Card */}
      <div className="md:col-span-5 bg-gradient-to-br from-accent to-accent-dark text-accent-foreground p-6 md:p-7 rounded-2xl shadow-card space-y-5">
        <h4 className="font-display text-xl font-bold border-b border-accent-foreground/10 pb-3 flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Guadagno Mensile Stimato
        </h4>

        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between items-center opacity-90">
            <span>Stipendio Netto Mensile:</span>
            <span className="font-semibold">€ {guadagnoMensile.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center opacity-90">
            <span>Rateo TFR (Liquidazione):</span>
            <span className="font-semibold">~ € {tfrStima.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center opacity-90">
            <span>Rateo Tredicesima:</span>
            <span className="font-semibold">~ € {tredicesimaStima.toFixed(2)}</span>
          </div>
          <div className="border-t border-accent-foreground/20 pt-4 flex justify-between items-end">
            <div>
              <span className="block text-xs uppercase tracking-wider opacity-70">Stima Netta in busta paga</span>
              <span className="text-2xl font-bold font-display">€ {guadagnoMensile.toFixed(2)}</span>
            </div>
            <span className="text-[10px] opacity-70 bg-black/20 px-2 py-1 rounded-full">Al mese</span>
          </div>
        </div>

        <div className="bg-white/10 p-3.5 rounded-xl space-y-2 text-xs">
          <div className="flex gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-white" />
            <p className="leading-tight">FamilyCare ti garantisce contratti in regola al 100% e pagamenti regolari ogni mese.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
