import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2, HeartHandshake, Briefcase } from "lucide-react";
import { joinWaitlist } from "@/functions/waitlist.functions";
import { toast } from "sonner";

type ServiceKey = "babysitter" | "badanti" | "colf" | "dogsitter" | "tutor";

const SERVICE_OPTIONS: { value: ServiceKey; label: string }[] = [
  { value: "babysitter", label: "Babysitter" },
  { value: "badanti", label: "Badante / Assistente familiare" },
  { value: "colf", label: "Colf e pulizie" },
  { value: "dogsitter", label: "Dog sitter" },
  { value: "tutor", label: "Ripetizioni / Tutor" },
];

const CITIES = [
  "Milano",
  "Roma",
  "Torino",
  "Napoli",
  "Bologna",
  "Firenze",
  "Genova",
  "Palermo",
  "Bari",
  "Altra città",
];

const NATIONALITIES = [
  "Italiana",
  "Romena",
  "Ucraina",
  "Moldava",
  "Filippina",
  "Sudamericana",
  "Altra",
];

type Tab = "famiglia" | "professionista";

export function WaitlistForm({ defaultTab = "famiglia" }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div>
      <div role="tablist" className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-2xl mb-6">
        <button
          role="tab"
          aria-selected={tab === "famiglia"}
          onClick={() => setTab("famiglia")}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-semibold transition-all ${
            tab === "famiglia"
              ? "bg-background text-primary shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HeartHandshake className="h-4 w-4" />
          Cerco aiuto
        </button>
        <button
          role="tab"
          aria-selected={tab === "professionista"}
          onClick={() => setTab("professionista")}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-semibold transition-all ${
            tab === "professionista"
              ? "bg-background text-primary shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Offro servizi
        </button>
      </div>

      {tab === "famiglia" ? <FamilyForm /> : <ProForm />}
    </div>
  );
}

function ServiceChips({
  value,
  onChange,
  accent = "primary",
}: {
  value: ServiceKey[];
  onChange: (v: ServiceKey[]) => void;
  accent?: "primary" | "sage";
}) {
  const toggle = (k: ServiceKey) =>
    onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);

  return (
    <div className="flex flex-wrap gap-2">
      {SERVICE_OPTIONS.map((opt) => {
        const active = value.includes(opt.value);
        const baseActive =
          accent === "sage"
            ? "border-primary bg-primary/10 text-primary"
            : "border-primary bg-primary/10 text-primary";
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
              active
                ? baseActive
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SuccessCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl bg-primary-soft border border-primary/20 p-7 text-center">
      <div className="mx-auto h-12 w-12 grid place-items-center rounded-full bg-primary text-primary-foreground mb-3">
        <Check className="h-6 w-6" strokeWidth={3} />
      </div>
      <p className="font-display text-2xl font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground mt-2">{message}</p>
    </div>
  );
}

function FamilyForm() {
  const join = useServerFn(joinWaitlist);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState<ServiceKey[]>([]);
  const [frequency, setFrequency] = useState("");
  const [urgency, setUrgency] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (services.length === 0) {
      toast.error("Seleziona almeno un servizio");
      return;
    }
    setLoading(true);
    try {
      const res = await join({
        data: {
          email,
          full_name: fullName,
          userType: "famiglia",
          city,
          message,
          source: "famiglia_form",
          phone,
          services,
          frequency,
          urgency,
        },
      });
      if (res.success) {
        setDone(true);
        toast.success("Richiesta inviata. Ti contattiamo entro 24 ore.");
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
      <SuccessCard
        title="Richiesta ricevuta!"
        message="Entro 24 ore ti scriviamo con i profili selezionati per la tua zona."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nome e cognome *">
          <Input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Il tuo nome"
            className="h-11 rounded-xl"
            maxLength={120}
          />
        </Field>
        <Field label="Telefono / WhatsApp *">
          <Input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+39 320 000 0000"
            className="h-11 rounded-xl"
            maxLength={40}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Email *">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@email.it"
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Città *">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Seleziona la città" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Tipo di servizio * (puoi sceglierne più di uno)">
        <ServiceChips value={services} onChange={setServices} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Frequenza">
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Quanto spesso?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Una tantum">Una tantum</SelectItem>
              <SelectItem value="Settimanale">Settimanale</SelectItem>
              <SelectItem value="Plurisettimanale">Plurisettimanale</SelectItem>
              <SelectItem value="Full time">Full time</SelectItem>
              <SelectItem value="H24 convivente">H24 convivente</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Urgenza">
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Quando ti serve?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Urgente (entro 3 giorni)">Urgente (entro 3 giorni)</SelectItem>
              <SelectItem value="Entro 2 settimane">Entro 2 settimane</SelectItem>
              <SelectItem value="Entro un mese">Entro un mese</SelectItem>
              <SelectItem value="Sto valutando">Sto valutando</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Note aggiuntive">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Descrivi la situazione: età della persona da assistere, bisogni specifici, orari…"
          className="rounded-xl min-h-[100px]"
          maxLength={2000}
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-soft"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Invia richiesta — risposta entro 24 ore"
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Conforme GDPR · I tuoi dati non vengono condivisi con terzi.
      </p>
    </form>
  );
}

function ProForm() {
  const join = useServerFn(joinWaitlist);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState<ServiceKey[]>([]);
  const [experience, setExperience] = useState("");
  const [italianLevel, setItalianLevel] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (services.length === 0) {
      toast.error("Seleziona almeno un servizio che offri");
      return;
    }
    setLoading(true);
    try {
      const res = await join({
        data: {
          email,
          full_name: fullName,
          userType: "professionista",
          city,
          message,
          source: "pro_form",
          phone,
          services,
          experience,
          italian_level: italianLevel,
          nationality,
          birth_date: birthDate,
        },
      });
      if (res.success) {
        setDone(true);
        toast.success("Profilo creato! Ti contattiamo a breve.");
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
      <SuccessCard
        title="Profilo registrato!"
        message="Entro 48 ore il tuo profilo sarà visibile alle famiglie nella tua zona."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nome e cognome *">
          <Input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nome e cognome"
            className="h-11 rounded-xl"
            maxLength={120}
          />
        </Field>
        <Field label="Data di nascita">
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Telefono / WhatsApp *">
          <Input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+39 320 000 0000"
            className="h-11 rounded-xl"
            maxLength={40}
          />
        </Field>
        <Field label="Email *">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@email.it"
            className="h-11 rounded-xl"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nazionalità *">
          <Select value={nationality} onValueChange={setNationality}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Seleziona" />
            </SelectTrigger>
            <SelectContent>
              {NATIONALITIES.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Città di lavoro *">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Dove lavori?" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
              <SelectItem value="Mi sposto ovunque">Mi sposto ovunque</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Servizi offerti * (puoi sceglierne più di uno)">
        <ServiceChips value={services} onChange={setServices} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Anni di esperienza">
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Quanta esperienza?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Prima esperienza">Prima esperienza</SelectItem>
              <SelectItem value="1-2 anni">1-2 anni</SelectItem>
              <SelectItem value="3-5 anni">3-5 anni</SelectItem>
              <SelectItem value="6-10 anni">6-10 anni</SelectItem>
              <SelectItem value="Più di 10 anni">Più di 10 anni</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Italiano parlato">
          <Select value={italianLevel} onValueChange={setItalianLevel}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Livello" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Base">Base</SelectItem>
              <SelectItem value="Buono">Buono</SelectItem>
              <SelectItem value="Ottimo / madrelingua">Ottimo / madrelingua</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Presentazione (max 150 parole)">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mi chiamo… ho X anni di esperienza come… So fare…"
          className="rounded-xl min-h-[110px]"
          maxLength={2000}
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-soft"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Crea il mio profilo — è gratis"
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Iscrizione 100% gratuita · Profilo verificato prima della pubblicazione.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}
