import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Search, Heart, MessageCircle, Calendar, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/come-funziona")({
  head: () => ({
    meta: [
      { title: "Come funziona — Dalla ricerca alla videochiamata | Family Care" },
      {
        name: "description",
        content:
          "Scopri come funziona Family Care: dimmi cosa cerchi, guarda i profili verificati, chatta e fai una videochiamata conoscitiva prima di scegliere.",
      },
      { property: "og:title", content: "Come funziona Family Care" },
      {
        property: "og:description",
        content:
          "Profili verificati, chat illimitata e videochiamata conoscitiva prima di scegliere.",
      },
    ],
  }),
  component: HowPage,
});

function HowPage() {
  const steps = [
    {
      icon: Search,
      title: "Dimmi cosa cerchi",
      text: "Scegli categoria, zona, giorni e orari. Aggiungi esigenze speciali (allergie, animali, lingue, ecc.).",
    },
    {
      icon: Heart,
      title: "Guarda i profili verificati",
      text: "Foto, video di presentazione, esperienza, zona e servizi. Ogni profilo ha l'identità già verificata dal nostro team.",
    },
    {
      icon: MessageCircle,
      title: "Chatta senza limiti",
      text: "Messaggi illimitati con i profili che contatti, dentro la piattaforma. Il tuo numero privato non viene mai condiviso.",
    },
    {
      icon: Calendar,
      title: "Vedetevi in videochiamata",
      text: "Con i piani Plus e Premium fissi una videochiamata conoscitiva senza impegno, poi decidi con calma. L'accordo lo prendete direttamente voi.",
    },
  ];

  return (
    <>
      <Section className="bg-gradient-hero pt-20 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
            Come funziona
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
            Dalla ricerca alla <em className="italic text-primary">videochiamata</em>,
            <br />
            senza uscire dalla piattaforma.
          </h1>
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-card border border-border rounded-3xl p-8 flex gap-5">
              <div className="shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-primary-soft text-primary grid place-items-center">
                  <s.icon className="h-7 w-7" />
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
                <h3 className="font-display text-2xl font-semibold mt-1">{s.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <SectionHeader
          eyebrow="Per i professionisti"
          title="Lavora con chi ti rispetta"
          subtitle="Anche tu sei un professionista della cura? Su Family Care ti iscrivi gratis e ti fai trovare dalle famiglie della tua zona."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              t: "Iscrizione gratuita",
              d: "Nessun costo di iscrizione e nessuna commissione sul rapporto tra te e la famiglia.",
            },
            {
              icon: Sparkles,
              t: "Profilo con video",
              d: "Foto, video di presentazione, esperienza e attestati: ti presenti per come sei davvero.",
            },
            {
              icon: Calendar,
              t: "Contatti da famiglie abbonate",
              d: "Ti scrivono solo famiglie con un piano attivo: chi ti contatta sta cercando davvero.",
            },
          ].map((it) => (
            <div key={it.t} className="bg-card rounded-3xl p-7 border border-border">
              <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground grid place-items-center mb-4">
                <it.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{it.t}</h3>
              <p className="text-sm text-muted-foreground">{it.d}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-7"
          >
            <Link to="/" hash="iscriviti">
              Iscriviti come professionista
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
