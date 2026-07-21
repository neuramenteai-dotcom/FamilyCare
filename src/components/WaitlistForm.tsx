import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { POLICY_VERSION } from "@/lib/legal";
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
import { supabase } from "@/integrations/supabase/client";

type ServiceKey = "babysitter" | "badanti" | "colf" | "dogsitter" | "tutor";

const SERVICE_OPTIONS: { value: ServiceKey; label: string }[] = [
  { value: "babysitter", label: "Babysitter" },
  { value: "badanti", label: "Collaboratrice domestica / Assistente familiare" },
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

// Consensi GDPR condivisi tra i due form: privacy/termini obbligatoria,
// marketing facoltativo. Entrambe le checkbox partono non spuntate.
function ConsentFields({
  privacyAccepted,
  setPrivacyAccepted,
  marketingConsent,
  setMarketingConsent,
}: {
  privacyAccepted: boolean;
  setPrivacyAccepted: (v: boolean) => void;
  marketingConsent: boolean;
  setMarketingConsent: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
        <Checkbox
          checked={privacyAccepted}
          onCheckedChange={(v) => setPrivacyAccepted(v === true)}
          className="mt-0.5"
          aria-label="Accetto privacy e termini"
        />
        <span>
          Ho letto e accetto la{" "}
          <Link to="/privacy" target="_blank" className="text-primary underline">
            Privacy Policy
          </Link>{" "}
          e i{" "}
          <Link to="/termini" target="_blank" className="text-primary underline">
            Termini di Servizio
          </Link>
          . <span className="text-destructive">*</span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
        <Checkbox
          checked={marketingConsent}
          onCheckedChange={(v) => setMarketingConsent(v === true)}
          className="mt-0.5"
          aria-label="Consenso comunicazioni promozionali"
        />
        <span>
          Acconsento a ricevere comunicazioni promozionali e inviti via email e WhatsApp da
          FamilyCare (facoltativo, revocabile in ogni momento).
        </span>
      </label>
    </div>
  );
}

function FamilyForm() {
  const navigate = useNavigate();
  const join = useServerFn(joinWaitlist);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState<ServiceKey[]>([]);
  const [frequency, setFrequency] = useState("");
  const [urgency, setUrgency] = useState("");
  const [message, setMessage] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (services.length === 0) {
      toast.error("Seleziona almeno un servizio");
      return;
    }
    if (!privacyAccepted) {
      toast.error("Per procedere devi accettare la Privacy Policy e i Termini di Servizio");
      return;
    }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, user_type: "famiglia" },
          emailRedirectTo: `${window.location.origin}/conferma-email`,
        },
      });

      if (authError) {
        toast.error("Errore durante la registrazione: " + authError.message);
        setLoading(false);
        return;
      }

      const res = await join({
        data: {
          email,
          auth_id: authData.user?.id,
          full_name: fullName,
          userType: "famiglia",
          city,
          message,
          source: "famiglia_form",
          phone,
          services,
          frequency,
          urgency,
          privacy_accepted: true,
          marketing_consent: marketingConsent,
          consent_policy_version: POLICY_VERSION,
        },
      });
      if (res.duplicate) {
        toast.error("Questa email è già registrata. Effettua il login.");
        return;
      }

      if (res.success) {
        if (authData.session) {
          navigate({ to: "/famiglia/dashboard" });
        } else {
          setDone(true);
        }
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
        title="Controlla la tua email"
        message="Ti abbiamo inviato un link per confermare l'iscrizione. Clicca sul link nell'email per attivare il tuo account e accedere alla dashboard."
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
        <Field label="Scegli una password *">
          <Input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimo 6 caratteri"
            className="h-11 rounded-xl"
            minLength={6}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
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

      <ConsentFields
        privacyAccepted={privacyAccepted}
        setPrivacyAccepted={setPrivacyAccepted}
        marketingConsent={marketingConsent}
        setMarketingConsent={setMarketingConsent}
      />

      <Button
        type="submit"
        disabled={loading || !privacyAccepted}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-soft"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Invia richiesta — risposta entro 24 ore"
        )}
      </Button>
    </form>
  );
}

function ProForm() {
  const navigate = useNavigate();
  const join = useServerFn(joinWaitlist);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nationality, setNationality] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState<ServiceKey[]>([]);
  const [experience, setExperience] = useState("");
  const [italianLevel, setItalianLevel] = useState("");
  const [gender, setGender] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (services.length === 0) {
      toast.error("Seleziona almeno un servizio che offri");
      return;
    }
    if (!privacyAccepted) {
      toast.error("Per procedere devi accettare la Privacy Policy e i Termini di Servizio");
      return;
    }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, user_type: "professionista" },
          emailRedirectTo: `${window.location.origin}/conferma-email`,
        },
      });

      if (authError) {
        toast.error("Errore durante la registrazione: " + authError.message);
        setLoading(false);
        return;
      }

      const res = await join({
        data: {
          email,
          auth_id: authData.user?.id,
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
          gender,
          video_url: videoUrl,
          privacy_accepted: true,
          marketing_consent: marketingConsent,
          consent_policy_version: POLICY_VERSION,
        },
      });
      if (res.duplicate) {
        toast.error("Questa email è già registrata. Effettua il login.");
        return;
      }

      if (res.success && res.id) {
        if (authData.session) {
          navigate({ to: "/professionista/dashboard" });
        } else {
          // Double opt-in: l'email non è ancora confermata, quindi non c'è
          // sessione. L'utente conferma via email e viene poi indirizzato alla
          // verifica del documento (/conferma-email → /verifica-identita/$id).
          setDone(true);
        }
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
        title="Controlla la tua email"
        message="Ti abbiamo inviato un link per confermare l'iscrizione. Dopo la conferma potrai caricare il documento d'identità per completare la verifica del profilo."
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
        <Field label="Scegli una password *">
          <Input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimo 6 caratteri"
            className="h-11 rounded-xl"
            minLength={6}
          />
        </Field>
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

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Sesso">
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Seleziona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Donna">Donna</SelectItem>
              <SelectItem value="Uomo">Uomo</SelectItem>
              <SelectItem value="Altro">Altro</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Video di presentazione">
          <Input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Link a YouTube o Vimeo (opzionale)"
            className="h-11 rounded-xl"
            maxLength={1000}
          />
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

      <ConsentFields
        privacyAccepted={privacyAccepted}
        setPrivacyAccepted={setPrivacyAccepted}
        marketingConsent={marketingConsent}
        setMarketingConsent={setMarketingConsent}
      />

      <Button
        type="submit"
        disabled={loading || !privacyAccepted}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-soft"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crea il mio profilo — è gratis"}
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
