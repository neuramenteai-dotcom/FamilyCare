import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createCheckoutSession } from "@/functions/payment.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { PLAN_TIERS, PLANS, type PlanTier } from "@/lib/plans";

export const Route = createFileRoute("/prezzi")({
  head: () => ({
    meta: [
      { title: "Prezzi — Piani flessibili per famiglie | Family Care" },
      {
        name: "description",
        content:
          "Tre piani per le famiglie da €29,99 a €79,99/mese. I professionisti non pagano mai.",
      },
      { property: "og:title", content: "Prezzi Family Care — Trasparenti e flessibili" },
      {
        property: "og:description",
        content:
          "Tre piani per le famiglie da €29,99 a €79,99/mese. I professionisti non pagano mai.",
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

function PricingPage() {
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckoutSession);
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setHasSession(!!session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleCheckout(tier: PlanTier) {
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
            Trasparenti. <em className="italic text-primary">Sempre.</em>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            I professionisti non pagano mai per essere su Family Care. Le famiglie scelgono il piano
            che preferiscono. Disdici quando vuoi.
          </p>
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
                  Scegli {plan.label}
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
            {
              q: "Posso disdire quando voglio?",
              a: "Sì. Gestisci o disdici l'abbonamento dal tuo profilo, senza penali, in 1 click.",
            },
            {
              q: "I professionisti pagano qualcosa?",
              a: "No. Family Care è completamente gratuito per i professionisti.",
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
    </>
  );
}
