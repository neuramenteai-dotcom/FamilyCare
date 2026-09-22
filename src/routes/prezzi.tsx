import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2, Clock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createCheckoutSession } from "@/functions/payment.functions";
import { joinWaitlist } from "@/functions/waitlist.functions";
import { supabase } from "@/integrations/supabase/client";
import { POLICY_VERSION } from "@/lib/legal";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { PLAN_TIERS, PLANS, ABBONAMENTI_ATTIVI, type PlanTier } from "@/lib/plans";

const CITTA = ["Roma", "Milano", "Torino", "Napoli", "Bologna", "Firenze", "Altra città"];

export const Route = createFileRoute("/prezzi")({
  head: () => ({
    meta: [
      { title: "Prezzi — Piani flessibili per famiglie | FamilyCare" },
      {
        name: "description",
        content: "Tre piani per le famiglie da €29,99 a €79,99/mese. I professionisti non pagano.",
      },
      { property: "og:title", content: "Prezzi FamilyCare — Trasparenti e flessibili" },
      {
        property: "og:description",
        content:
          "Tre piani per le famiglie da €29,99 a €79,99/mese. I professionisti non pagano.",
      },
    ],
  }),
  component: PricingPage,
});

const FEATURES: Record<PlanTier, string[]> = {
  base: [
    "Vedi tutti i profili (età, nazionalità, esperienza, specializzazione, zona, video)",
    "Contatta e chatta con 5 profili",
    "Chat illimitata con i profili contattati",
  ],
  plus: [
    "Tutto del piano Base",
    "Contatta e chatta con 20 profili",
    "Badge verifica approfondita (casellario, referenze, attestati)",
    "Videochiamate con i profili",
  ],
  premium: [
    "Tutto del piano Plus",
    "Contatti illimitati con tutti i profili",
    "Supporto documentale per l'assunzione",
    "Concierge: selezioniamo noi i 3 profili migliori per te",
  ],
};

// Modulo di interesse mostrato finché gli abbonamenti non sono attivabili.
// Registra email, città e quale piano interessa: serve a sapere come si
// distribuisce la domanda fra i tre livelli prima di aprire le vendite.
function ModuloInteresse({ tier, onClose }: { tier: PlanTier | null; onClose: () => void }) {
  const join = useServerFn(joinWaitlist);
  const [email, setEmail] = useState("");
  const [citta, setCitta] = useState("Roma");
  const [privacy, setPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fatto, setFatto] = useState(false);

  const piano = tier ? PLANS[tier] : null;

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    if (!privacy) {
      toast.error("Per procedere devi accettare la Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      const res = await join({
        data: {
          email,
          userType: "famiglia" as const,
          city: citta,
          source: "waitlist" as const,
          message: piano ? `Interesse per il piano ${piano.label} (${piano.priceLabel}/mese)` : "",
          privacy_accepted: true as const,
          marketing_consent: false,
          consent_policy_version: POLICY_VERSION,
        },
      });
      if (res.duplicate) {
        toast.success("Sei già in lista: ti avvisiamo appena apriamo nella tua città.");
        setFatto(true);
      } else if (res.success) {
        setFatto(true);
      } else {
        toast.error(res.error || "Non siamo riusciti a registrarti. Riprova.");
      }
    } catch {
      toast.error("Errore di connessione. Riprova fra poco.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={tier !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {fatto ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Ci sei.</DialogTitle>
              <DialogDescription>
                Ti scriviamo appena apriamo gli abbonamenti a {citta}. Chi è in lista entra per
                primo.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={onClose} className="w-full h-11 rounded-full mt-2">
              Chiudi
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                Ti avvisiamo quando apriamo{piano ? ` il piano ${piano.label}` : ""}
              </DialogTitle>
              <DialogDescription>
                Stiamo selezionando i primi professionisti verificati. Lasciaci un contatto: ti
                scriviamo appena la tua città è pronta.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={invia} className="space-y-4">
              <div>
                <Label htmlFor="int-email">Email *</Label>
                <Input
                  id="int-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.it"
                  className="h-11 rounded-xl mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="int-citta">Città *</Label>
                <Select value={citta} onValueChange={setCitta}>
                  <SelectTrigger id="int-citta" className="h-11 rounded-xl mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITTA.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#b22b2b]"
                />
                <span>
                  Ho letto la{" "}
                  <Link to="/privacy" className="text-primary underline">
                    Privacy Policy
                  </Link>{" "}
                  e acconsento al trattamento dei miei dati per essere ricontattato.
                </span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#b22b2b] hover:bg-[#b22b2b]/90 text-white"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Avvisami
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PricingPage() {
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckoutSession);
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [interesseTier, setInteresseTier] = useState<PlanTier | null>(null);

  // Pagina pubblica: la sessione serve solo a decidere dove mandare l'utente al
  // clic. Se il client Supabase non è disponibile (es. variabili di build
  // mancanti) trattiamo l'utente come non autenticato invece di far cadere la
  // pagina: i prezzi devono restare leggibili in ogni caso.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      supabase.auth
        .getSession()
        .then(({ data }) => setHasSession(!!data.session))
        .catch(() => setHasSession(false));
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => setHasSession(!!session));
      unsubscribe = () => subscription.unsubscribe();
    } catch (err) {
      console.error("Supabase non disponibile nel browser:", err);
      setHasSession(false);
    }
    return () => unsubscribe?.();
  }, []);

  async function handleCheckout(tier: PlanTier) {
    if (!ABBONAMENTI_ATTIVI) {
      setInteresseTier(tier);
      return;
    }
    if (!hasSession) {
      navigate({ to: "/", hash: "iscriviti" });
      return;
    }
    setLoadingTier(tier);
    try {
      const res = await checkout({
        data: { tier, returnUrl: window.location.origin + "/famiglia/dashboard" },
      });
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error(res.error || "Errore durante l'inizializzazione del pagamento.");
        setLoadingTier(null);
      }
    } catch {
      toast.error("Errore di connessione a Stripe.");
      setLoadingTier(null);
    }
  }

  return (
    <>
      <Section className="bg-gradient-hero pt-20 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
            Prezzi
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
            Trasparenti. <em className="italic text-primary">Senza sorprese.</em>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            I professionisti non pagano per essere su FamilyCare. Le famiglie scelgono il piano che
            preferiscono. Disdici quando vuoi.
          </p>

          {!ABBONAMENTI_ATTIVI && (
            <div className="mt-8 text-left bg-card border border-border rounded-2xl p-5 flex gap-4">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">I piani non sono ancora attivabili.</strong>{" "}
                Stiamo selezionando i primi professionisti verificati, a partire da Roma. Appena ci
                saranno profili veri da mostrarti apriremo gli abbonamenti, e chi è in lista verrà
                avvisato per primo. Preferiamo farti aspettare qualche settimana piuttosto che
                venderti l'accesso a un catalogo vuoto.
              </p>
            </div>
          )}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLAN_TIERS.map((tier) => {
            const plan = PLANS[tier];
            const highlighted = tier === "plus";
            return (
              <div
                key={tier}
                className={`relative rounded-[2rem] p-8 flex flex-col shadow-sm ${
                  highlighted
                    ? "bg-[#b22b2b] text-white shadow-lg md:scale-105 z-10"
                    : "bg-background border border-border/60"
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2d2d2d] text-white text-xs font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="text-[10px]">✨</span> Più scelto
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold">{plan.label}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-5xl font-bold">€{plan.priceLabel.replace("€", "")}</span>
                  <span
                    className={`text-sm ml-1 ${highlighted ? "text-white/90" : "text-muted-foreground"}`}
                  >
                    /mese
                  </span>
                </div>
                <ul className="space-y-3 text-sm flex-grow mb-8">
                  {FEATURES[tier].map((f, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${highlighted ? "text-white" : "text-[#b22b2b]"}`}
                        strokeWidth={2.5}
                      />
                      <span className={highlighted ? "text-white" : "text-muted-foreground"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full h-12 rounded-full font-medium ${
                    highlighted
                      ? "bg-[#fffcf5] text-[#b22b2b] hover:bg-[#fffcf5]/90"
                      : "bg-[#b22b2b] hover:bg-[#b22b2b]/90 text-white"
                  }`}
                  onClick={() => handleCheckout(tier)}
                  disabled={loadingTier !== null}
                >
                  {loadingTier === tier ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {ABBONAMENTI_ATTIVI ? `Scegli ${plan.label}` : "Avvisami quando apre"}
                </Button>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <SectionHeader eyebrow="Domande frequenti" title="Le risposte più cercate" />
        <div className="max-w-3xl mx-auto space-y-3">
          {[
            ...(ABBONAMENTI_ATTIVI
              ? []
              : [
                  {
                    q: "Quando potrò abbonarmi?",
                    a: "Appena nella tua città ci saranno abbastanza professionisti verificati da rendere utile la ricerca. Partiamo da Roma. Lasciaci l'email dal pulsante qui sopra e ti avvisiamo: nessun pagamento è richiesto ora.",
                  },
                ]),
            {
              q: "Posso disdire quando voglio?",
              a: "Sì. Gestisci o disdici l'abbonamento dal tuo profilo, senza penali, in un clic.",
            },
            {
              q: "I professionisti pagano qualcosa?",
              a: "No. FamilyCare è completamente gratuito per i professionisti.",
            },
            {
              q: "Cosa include il piano Premium?",
              a: "Contatti illimitati, supporto documentale per l'assunzione e il servizio concierge: selezioniamo noi i 3 profili migliori per te.",
            },
            {
              q: "I prezzi indicati includono il compenso del professionista?",
              a: "I prezzi dei servizi (es. €8/h babysitter) sono il compenso del professionista. L'abbonamento copre l'uso della piattaforma.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group bg-card border border-border rounded-2xl p-5 cursor-pointer"
            >
              <summary className="font-semibold flex items-center justify-between list-none">
                {f.q}
                <span className="text-primary text-2xl group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-muted-foreground text-sm mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <ModuloInteresse tier={interesseTier} onClose={() => setInteresseTier(null)} />
    </>
  );
}
