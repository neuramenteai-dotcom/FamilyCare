import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, ArrowRight, ArrowLeft, Loader2, Award, Shield, FileCheck, CheckCircle2 } from "lucide-react";
import { joinWaitlist } from "@/functions/waitlist.functions";
import { toast } from "sonner";

const NAZIONALITA = ["Italiana", "Romena", "Ucraina", "Moldava", "Filippina", "Peruviana", "Ecuadoriana", "Altra"];
const ZONE_ROMA = [
  "Centro / Prati",
  "Parioli / Trieste",
  "EUR / Ostiense",
  "Tuscolano / Appio",
  "Tiburtina",
  "Centocelle / Prenestina",
  "Montesacro / Talenti",
  "Mi sposto ovunque",
];
const SERVIZI_LAV = [
  { key: "badanti", label: "Assistente anziani H24 / ore" },
  { key: "babysitter", label: "Baby Sitter" },
  { key: "colf", label: "Colf e pulizie" },
  { key: "dogsitter", label: "Dog Sitter" },
  { key: "tutor", label: "Supporto compiti / Tutor" },
];
const DOCUMENTI = [
  "Carta d'identità italiana / UE",
  "Permesso di soggiorno valido",
  "Codice fiscale",
  "Patente di guida",
];
const COMPETENZE = [
  "Anziani allettati",
  "Alzheimer / demenze",
  "Parkinson",
  "Post-operatorio",
  "Disabilità fisica",
  "Igiene avanzata / medicazioni",
  "Cucina italiana",
  "Guida e accompagnamento",
];
const DISPONIBILITA = [
  "Mattina (7-13)",
  "Pomeriggio (13-20)",
  "Sera / notte",
  "Lun-Ven",
  "Weekend",
  "Festivi",
  "Convivenza (H24)",
];

export function MultiStepProForm() {
  const navigate = useNavigate();
  const submitWaitlist = useServerFn(joinWaitlist);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [city, setCity] = useState("Roma");
  const [zona, setZona] = useState("");
  const [documenti, setDocumenti] = useState<string[]>([]);
  const [services, setServices] = useState<("babysitter" | "badanti" | "colf" | "dogsitter" | "tutor")[]>([]);
  const [experience, setExperience] = useState("");
  const [italianLevel, setItalianLevel] = useState("");
  const [competenze, setCompetenze] = useState<string[]>([]);
  const [disponibilita, setDisponibilita] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const toggleArray = (arr: string[], setArr: (x: any) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const isStepValid = () => {
    if (step === 1) return fullName.trim() !== "" && phone.trim() !== "" && email.trim() !== "";
    if (step === 2) return nationality !== "" && (city !== "Roma" || zona !== "");
    if (step === 3) return services.length > 0 && experience !== "" && italianLevel !== "";
    if (step === 4) return disponibilita.length > 0 && consent;
    return false;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(step + 1);
    } else {
      toast.error("Compila tutti i campi obbligatori per procedere.");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;
    setLoading(true);

    try {
      const res = await submitWaitlist({
        data: {
          email,
          full_name: fullName,
          userType: "professionista",
          city,
          zona: city === "Roma" ? zona : "",
          message,
          source: "pro_form",
          phone,
          services,
          experience,
          italian_level: italianLevel,
          nationality,
          birth_date: birthDate,
          documenti,
          competenze,
          disponibilita,
        },
      });

      if (res.duplicate) {
        toast.error("Questa email è già registrata. Effettua il login.");
        return;
      }
      
      if (res.success && res.id) {
        toast.success("Profilo registrato con successo!");
        navigate({ to: '/verifica-identita/$id', params: { id: res.id } });
      } else if (res.success) {
        setDone(true);
        toast.success("Profilo registrato con successo!");
      } else {
        toast.error(res.error || "Errore durante il salvataggio.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-soft max-w-xl mx-auto space-y-6">
        <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-3xl font-bold text-foreground">Profilo Registrato!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Entro 48 ore verificheremo le tue referenze e i tuoi documenti.<br />
            Ti contatteremo su WhatsApp al numero indicato per attivare il profilo e farti incontrare le famiglie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-stretch">
      {/* Side Perks Info panel */}
      <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-8 rounded-3xl flex flex-col justify-between">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wide text-white">
            <Award className="h-3.5 w-3.5 text-accent" />
            Crea il tuo profilo
          </span>
          <h3 className="font-display text-3xl font-semibold leading-tight text-white">
            Iscriviti gratis.<br />Cerchiamo lavoro per te.
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Iscrizione 100% gratuita. Il tuo profilo sarà verificato dal nostro team e proposto alle famiglie in regola entro 48 ore.
          </p>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex gap-3">
              <span className="h-5 w-5 bg-accent/20 text-accent rounded-full grid place-items-center text-xs shrink-0 font-bold mt-0.5">✓</span>
              <div>
                <p className="text-xs font-bold text-white">0% Commissioni</p>
                <p className="text-[11px] text-slate-400">Tieni il 100% di quello che guadagni, nessun costo fisso.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="h-5 w-5 bg-accent/20 text-accent rounded-full grid place-items-center text-xs shrink-0 font-bold mt-0.5">✓</span>
              <div>
                <p className="text-xs font-bold text-white">Contratto CCNL Garantito</p>
                <p className="text-[11px] text-slate-400">Contributi INPS, TFR, ferie, malattia gestiti in regola.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="h-5 w-5 bg-accent/20 text-accent rounded-full grid place-items-center text-xs shrink-0 font-bold mt-0.5">✓</span>
              <div>
                <p className="text-xs font-bold text-white">Famiglie Verificate</p>
                <p className="text-[11px] text-slate-400">Nessuna perdita di tempo: ti connettiamo solo a richieste reali.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex gap-2.5 items-center text-xs text-slate-400">
          <Shield className="h-4 w-4 text-accent shrink-0" />
          <span>I tuoi dati sono protetti e conformi alle norme GDPR.</span>
        </div>
      </div>

      {/* Form area */}
      <div className="lg:col-span-7 bg-card border border-border p-6 md:p-8 rounded-3xl flex flex-col justify-between shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider text-primary">Passo {step} di 4</span>
              <span>
                {step === 1 && "Contatti"}
                {step === 2 && "Documenti & Zona"}
                {step === 3 && "Servizi & Esperienza"}
                {step === 4 && "Disponibilità"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i < step
                      ? "bg-accent"
                      : i === step
                      ? "bg-accent/40"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-display text-2xl font-bold">Iniziamo dalle tue informazioni</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome e cognome *</Label>
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Il tuo nome"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Data di nascita</Label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Telefono / WhatsApp *</Label>
                  <Input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+39 320 000 0000"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@email.it"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location and Documents */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-display text-2xl font-bold">Dove ti trovi e quali documenti possiedi</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nazionalità *</Label>
                  <Select value={nationality} onValueChange={setNationality}>
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue placeholder="Seleziona la tua nazionalità" />
                    </SelectTrigger>
                    <SelectContent>
                      {NAZIONALITA.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Città di lavoro *</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Roma">Roma</SelectItem>
                      <SelectItem value="Milano">Milano</SelectItem>
                      <SelectItem value="Torino">Torino</SelectItem>
                      <SelectItem value="Napoli">Napoli</SelectItem>
                      <SelectItem value="Bologna">Bologna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {city === "Roma" && (
                <div className="space-y-1.5">
                  <Label>Zona di Roma preferita *</Label>
                  <Select value={zona} onValueChange={setZona}>
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue placeholder="Seleziona zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONE_ROMA.map((z) => (
                        <SelectItem key={z} value={z}>
                          {z}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Documenti in possesso</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {DOCUMENTI.map((doc) => {
                    const checked = documenti.includes(doc);
                    return (
                      <label
                        key={doc}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                          checked
                            ? "bg-accent/5 border-accent text-accent"
                            : "bg-background border-border hover:border-accent/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArray(documenti, setDocumenti, doc)}
                          className="sr-only"
                        />
                        <FileCheck className={`h-4 w-4 ${checked ? "text-accent" : "text-muted-foreground"}`} />
                        <span>{doc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Experience, Services and Skills */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-display text-2xl font-bold">Le tue competenze e servizi</h4>
              <div className="space-y-1.5">
                <Label>Servizi che offri * (selezionane almeno uno)</Label>
                <div className="flex flex-wrap gap-2">
                  {SERVIZI_LAV.map((opt) => {
                    const active = services.includes(opt.key as any);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleArray(services as any, setServices, opt.key)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          active
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-background border-border text-muted-foreground hover:border-accent/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Anni di esperienza *</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue placeholder="Anni di lavoro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prima esperienza">Prima esperienza</SelectItem>
                      <SelectItem value="1-2 anni">1-2 anni</SelectItem>
                      <SelectItem value="3-5 anni">3-5 anni</SelectItem>
                      <SelectItem value="6-10 anni">6-10 anni</SelectItem>
                      <SelectItem value="Più di 10 anni">Più di 10 anni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Livello di italiano parlato *</Label>
                  <Select value={italianLevel} onValueChange={setItalianLevel}>
                    <SelectTrigger className="h-11 rounded-xl bg-background">
                      <SelectValue placeholder="Livello parlato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Base (A1/A2)">Base (A1/A2)</SelectItem>
                      <SelectItem value="Buono (B1/B2)">Buono (B1/B2)</SelectItem>
                      <SelectItem value="Ottimo / Madrelingua">Ottimo / Madrelingua</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Competenze specifiche / Specializzazioni</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {COMPETENZE.map((comp) => {
                    const checked = competenze.includes(comp);
                    return (
                      <label
                        key={comp}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                          checked
                            ? "bg-accent/5 border-accent text-accent"
                            : "bg-background border-border hover:border-accent/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArray(competenze, setCompetenze, comp)}
                          className="sr-only"
                        />
                        <Check className={`h-4 w-4 shrink-0 ${checked ? "opacity-100" : "opacity-0"}`} />
                        <span>{comp}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Availability and Consent */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-display text-2xl font-bold">Disponibilità oraria e note</h4>
              
              <div className="space-y-1.5">
                <Label>Orari di disponibilità * (selezionane almeno uno)</Label>
                <div className="flex flex-wrap gap-2">
                  {DISPONIBILITA.map((time) => {
                    const active = disponibilita.includes(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => toggleArray(disponibilita, setDisponibilita, time)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          active
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-background border-border text-muted-foreground hover:border-accent/40"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Presentazione personale (Consigliato)</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi due righe su di te, referenze telefoniche che puoi fornire o bisogni particolari..."
                  className="rounded-xl min-h-[100px]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs leading-relaxed text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-muted focus:ring-accent"
                  />
                  <span>
                    Accetto il trattamento dei dati personali ai fini della ricerca di lavoro (GDPR). Dichiaro che le informazioni fornite sono veritiere. *
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="h-11 px-5 rounded-xl border border-border">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Indietro
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button type="button" onClick={handleNext} className="h-11 px-6 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 ml-auto">
                Avanti
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading || !consent} className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 ml-auto shadow-soft">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Registra profilo
                    <Check className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
