import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, BadgeCheck, Lock, Sparkles, Heart, Users } from "lucide-react";
import { Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SERVICES } from "@/data/services";
import heroFamily from "@/assets/hero-family.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "FamilyCare — Babysitter, assistenti familiari, colf, dog sitter e tutor verificati",
      },
      {
        name: "description",
        content:
          "FamilyCare è la piattaforma italiana per trovare professionisti con identità verificata per la tua famiglia. Cerchi aiuto o vuoi offrire i tuoi servizi: iscrizione gratuita.",
      },
      { property: "og:title", content: "FamilyCare — La cura che la tua famiglia merita" },
      {
        property: "og:description",
        content:
          "Babysitter, colf, assistenti familiari, dog sitter e tutor verificati. Cerchi aiuto o offri i tuoi servizi: tutto in un'unica piattaforma.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <AudienceSplit />
      <ServicesPreview />
      <HowItWorks />
      <Guarantees />
      <Stats />
      <WaitlistCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 pt-16 md:pt-24 pb-20 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft text-primary px-4 py-1.5 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            Piattaforma in avvio · Iscrizioni aperte
          </span>
          <h1 className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[0.98] tracking-tight">
            La cura che la tua <span className="text-gradient-primary italic">famiglia</span>{" "}
            merita.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Babysitter, assistenti familiari, colf, dog sitter e tutor con identità verificata.
            Trova la persona giusta per la tua famiglia.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-14 px-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-base shadow-soft"
            >
              <Link to="/" hash="iscriviti">
                Iscriviti gratis <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-7 rounded-full border-2 text-base"
            >
              <Link to="/come-funziona">Come funziona</Link>
            </Button>
          </div>

          <div className="mt-10 flex items-start gap-3 max-w-md">
            <span className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-primary-soft text-primary grid place-items-center">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nessun profilo diventa visibile prima che{" "}
              <span className="font-semibold text-foreground">l'identità</span> sia stata
              verificata. È la regola da cui siamo partiti.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-soft aspect-[4/3]">
            <img
              src={heroFamily}
              alt="Famiglia italiana che usa FamilyCare"
              width={1536}
              height={1024}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="hidden md:flex absolute -left-6 top-8 bg-card rounded-2xl p-4 shadow-card items-center gap-3 max-w-[220px]">
            <div className="h-10 w-10 rounded-full bg-primary-soft grid place-items-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Identità verificata</p>
              <p className="text-xs text-muted-foreground">Prima della pubblicazione</p>
            </div>
          </div>

          <div className="hidden md:flex absolute -right-4 bottom-8 bg-card rounded-2xl p-4 shadow-card items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent grid place-items-center text-accent-foreground">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Gratis per i professionisti</p>
              <p className="text-xs text-muted-foreground">Nessun costo di iscrizione</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceSplit() {
  return (
    <Section className="bg-secondary/20" id="per-chi">
      <SectionHeader
        title={
          <>
            Una piattaforma. <em className="italic text-primary">Due percorsi.</em>
          </>
        }
        subtitle="Famiglie e professionisti hanno bisogni diversi. Per questo abbiamo costruito due esperienze su misura."
      />
      <p className="text-center text-sm font-semibold tracking-[0.18em] uppercase text-primary mb-6">
        FamilyCare è per te se…
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col">
          <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center mb-4">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">Sei una famiglia</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Raccontaci di cosa hai bisogno e scopri i profili verificati disponibili nella tua zona.
          </p>
          <ul className="space-y-2 text-sm mb-6">
            {[
              "Profilo con foto, esperienza dichiarata dal professionista ed eventuali video di presentazione",
              "Identità verificata",
              "Chat e videochiamate direttamente in piattaforma",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary-soft text-primary grid place-items-center text-xs font-bold">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="mt-auto h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link to="/" hash="iscriviti">
              Cerco aiuto per la mia famiglia <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col">
          <div className="h-12 w-12 rounded-2xl bg-foreground text-background grid place-items-center mb-4">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">Sei un professionista</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Babysitter, assistente familiare, colf, dog sitter o tutor: crea il tuo profilo e ricevi
            richieste dalle famiglie della tua zona.
          </p>
          <ul className="space-y-2 text-sm mb-6">
            {[
              "Iscrizione gratuita",
              "I contatti che riceverai provengono esclusivamente da famiglie motivate",
              "Profilo online dopo la verifica del documento d'identità",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-secondary text-foreground grid place-items-center text-xs font-bold">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-auto h-12 rounded-xl border-2">
            <Link to="/" hash="iscriviti">
              Mi iscrivo come professionista <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}

function ServicesPreview() {
  return (
    <Section id="servizi">
      <SectionHeader
        eyebrow="Una sola piattaforma"
        title={
          <>
            Tutto quello che serve <em className="italic text-primary">per la tua famiglia</em>
          </>
        }
        subtitle="Non più decine di siti, gruppi Facebook o passaparola. Una sola piattaforma per ogni bisogno di cura."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((s) => (
          <Link
            key={s.slug}
            to="/servizi"
            hash={s.slug}
            className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-soft hover:-translate-y-1 transition-all duration-300"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h3 className="font-display text-2xl font-semibold">{s.name}</h3>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  da <span className="font-semibold text-primary">{s.priceFrom}/h</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{s.tagline}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.available}</span>
                <span className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Scopri <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}

        <Link
          to="/servizi"
          className="group rounded-3xl bg-primary text-primary-foreground p-8 flex flex-col justify-between min-h-[280px] hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="h-8 w-8" />
          <div>
            <h3 className="font-display text-2xl font-semibold leading-tight">
              Esplora tutti i servizi
            </h3>
            <p className="text-primary-foreground/80 text-sm mt-2">
              Scopri prezzi, disponibilità e dettagli di ogni categoria.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all font-semibold">
              Vai ai servizi <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Racconta cosa cerchi",
      text: "Scegli il servizio, la zona e quando ti serve aiuto.",
    },
    {
      n: "02",
      title: "Scopri i profili giusti",
      text: "Sfoglia i profili verificati nella tua zona: età, esperienza, specializzazione, video di presentazione.",
    },
    {
      n: "03",
      title: "Conosci e decidi",
      text: "Chatta in piattaforma e fai una videochiamata conoscitiva, poi accordati direttamente con la persona che hai scelto.",
    },
  ];

  return (
    <Section className="bg-secondary/30">
      <SectionHeader
        eyebrow="Come funziona"
        title={
          <>
            Tre passi. <span className="text-primary italic">Zero stress.</span>
          </>
        }
        subtitle="Racconti cosa cerchi, guardi i profili verificati e conosci le persone prima di decidere."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div
            key={s.n}
            className="bg-card border border-border rounded-3xl p-7 relative overflow-hidden"
          >
            <span className="font-display text-7xl font-semibold text-primary-soft absolute -top-2 -right-2 select-none">
              {s.n}
            </span>
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-display font-bold text-lg mb-4">
                {parseInt(s.n)}
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Guarantees() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Identità verificata prima della pubblicazione",
      text: "Documento controllato dal nostro team. Obbligatorio, per tutti.",
    },
    {
      icon: BadgeCheck,
      title: "Bollini di verifica aggiuntivi",
      text: "Casellario, referenze, attestati. Volontari e visibili sul profilo.",
    },
    {
      icon: Lock,
      title: "Documenti mai condivisi",
      text: "Archiviati in privato. Alle famiglie mostriamo solo l'esito.",
    },
  ];

  return (
    <Section>
      <SectionHeader
        eyebrow="Verifiche"
        title={
          <>
            Come funziona il <em className="italic text-primary">controllo dei profili.</em>
          </>
        }
        subtitle="Niente formule generiche: ecco esattamente cosa succede prima che un profilo diventi visibile."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <div
            key={it.title}
            className="bg-card border border-border rounded-3xl p-7 flex flex-col"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">{it.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{it.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Stats() {
  const stats = [
    { n: "5", l: "Servizi in un'unica piattaforma" },
    { n: "0 €", l: "Costo per i professionisti" },
    { n: "Roma", l: "La città da cui partiamo" },
    { n: "3", l: "Piani per le famiglie, da 29,99 €" },
  ];
  return (
    <Section className="bg-primary text-primary-foreground" containerClassName="">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="font-display text-4xl md:text-5xl font-semibold">{s.n}</div>
            <div className="text-sm md:text-base text-primary-foreground/80 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WaitlistCTA() {
  return (
    <Section id="iscriviti">
      <div className="grid lg:grid-cols-2 gap-12 items-start bg-gradient-warm rounded-[2rem] p-8 md:p-14 border border-border">
        <div className="lg:sticky lg:top-24">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
            Iscrizione gratuita
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-[1.05]">
            Inizia subito con <span className="text-gradient-primary italic">FamilyCare</span>.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Scegli il tuo percorso: <strong className="text-foreground">cerco aiuto</strong> per la
            mia famiglia, oppure <strong className="text-foreground">offro servizi</strong> come
            professionista.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              {
                t: "Famiglie",
                d: "Abbonamento mensile da 29,99 € — disdici quando vuoi",
              },
              {
                t: "Professionisti",
                d: "Iscrizione gratuita, nessuna commissione",
              },
              {
                t: "Il tuo numero resta tuo",
                d: "Chatti e fai videochiamate dentro la piattaforma, senza dare il numero privato",
              },
            ].map((b) => (
              <li key={b.t} className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs">
                  ✓
                </span>
                <div>
                  <p className="font-semibold">{b.t}</p>
                  <p className="text-muted-foreground">{b.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
          <WaitlistForm />
        </div>
      </div>
    </Section>
  );
}
