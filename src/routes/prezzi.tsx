import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/prezzi")({
  head: () => ({
    meta: [
      { title: "Prezzi — Piani trasparenti per famiglie e professionisti | Family Care" },
      {
        name: "description",
        content:
          "Tre piani semplici e flessibili. Inizia gratis, paghi solo se trovi la persona giusta. Nessun costo nascosto.",
      },
      { property: "og:title", content: "Prezzi Family Care — Trasparenti e flessibili" },
      {
        property: "og:description",
        content: "Piani da €0 a €19.99/mese. Nessun costo di iscrizione, nessuna commissione nascosta.",
      },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Gratuito",
    price: "€0",
    period: "per sempre",
    desc: "Per esplorare la piattaforma senza impegno.",
    features: ["Navigazione profili illimitata", "Salva fino a 3 preferiti", "Visualizzazione profili base"],
    cta: "Inizia gratis",
    featured: false,
  },
  {
    name: "Starter",
    price: "€9,99",
    period: "al mese",
    desc: "Per chi cerca davvero la persona giusta.",
    features: [
      "5 contatti diretti al mese",
      "Messaggistica illimitata",
      "Filtri avanzati",
      "Supporto via email",
    ],
    cta: "Scegli Starter",
    featured: true,
    badge: "Più popolare",
  },
  {
    name: "Premium",
    price: "€19,99",
    period: "al mese",
    desc: "La massima tranquillità per la tua famiglia.",
    features: [
      "Contatti illimitati",
      "Template contratti CCNL pronti",
      "Garanzia sostituzione 48h",
      "Supporto prioritario 24/7",
      "Gestione amministrativa inclusa",
    ],
    cta: "Scegli Premium",
    featured: false,
  },
];

function PricingPage() {
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
            I professionisti non pagano mai per essere su Family Care.
            Le famiglie scelgono il piano che preferiscono. Disdici quando vuoi.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-8 flex flex-col ${
                p.featured
                  ? "bg-primary text-primary-foreground shadow-soft scale-[1.02]"
                  : "bg-card border border-border"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-foreground text-background text-xs font-semibold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" /> {p.badge}
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <p className={`text-sm mt-1 ${p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {p.desc}
              </p>
              <div className="mt-6 mb-6">
                <span className="font-display text-5xl font-semibold">{p.price}</span>
                <span className={`ml-1.5 text-sm ${p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {p.period}
                </span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={`h-5 w-5 shrink-0 ${p.featured ? "text-primary-foreground" : "text-primary"}`} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full h-12 rounded-full ${
                  p.featured
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <Link to="/" hash="iscriviti">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <SectionHeader eyebrow="Domande frequenti" title="Le risposte più cercate" />
        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { q: "Posso disdire quando voglio?", a: "Sì. Cancelli l'abbonamento dal tuo profilo, senza penali, in 1 click." },
            { q: "I professionisti pagano qualcosa?", a: "No. Family Care è completamente gratuito per i professionisti." },
            { q: "Cosa succede se non sono soddisfatto?", a: "Con il piano Premium hai la garanzia di sostituzione entro 48 ore. Senza domande." },
            { q: "I prezzi indicati includono il compenso del professionista?", a: "I prezzi dei servizi (es. €8/h babysitter) sono il compenso del professionista. L'abbonamento copre l'uso della piattaforma." },
          ].map((f) => (
            <details key={f.q} className="group bg-card border border-border rounded-2xl p-5 cursor-pointer">
              <summary className="font-semibold flex items-center justify-between list-none">
                {f.q}
                <span className="text-primary text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-muted-foreground text-sm mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
