import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Star, Heart, Users, Clock, MapPin } from "lucide-react";
import { Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SERVICES } from "@/data/services";
import heroFamily from "@/assets/hero-family.jpg";
import t1 from "@/assets/testimonial-1.jpg";
import t2 from "@/assets/testimonial-2.jpg";
import t3 from "@/assets/testimonial-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareTinder — Trova babysitter, badanti, colf, dog sitter e tutor verificati" },
      {
        name: "description",
        content:
          "La piattaforma italiana per trovare in pochi minuti professionisti verificati per la tua famiglia. Iscriviti gratis alla waitlist.",
      },
      { property: "og:title", content: "CareTinder — La cura che la tua famiglia merita" },
      {
        property: "og:description",
        content:
          "Babysitter, colf, badanti, dog sitter e tutor verificati. Tutto in un'unica piattaforma.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ServicesPreview />
      <HowItWorks />
      <Testimonials />
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
            Nuovo · Iscrizioni aperte
          </span>
          <h1 className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[0.98] tracking-tight">
            La cura che la tua{" "}
            <span className="text-gradient-primary italic">famiglia</span> merita.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Babysitter, badanti, colf, dog sitter e tutor verificati.
            Trova la persona giusta in pochi minuti, non in settimane.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-14 px-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-base shadow-soft">
              <Link to="/" hash="iscriviti">
                Iscriviti gratis <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 rounded-full border-2 text-base">
              <Link to="/come-funziona">Come funziona</Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[t1, t2, t3].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="text-sm font-semibold text-foreground ml-1">4.9/5</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Da <span className="font-semibold text-foreground">5.000+ famiglie</span> italiane
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-soft aspect-[4/3]">
            <img
              src={heroFamily}
              alt="Famiglia italiana che usa CareTinder"
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
              <p className="text-sm font-semibold">100% verificati</p>
              <p className="text-xs text-muted-foreground">Background check</p>
            </div>
          </div>

          <div className="hidden md:flex absolute -right-4 bottom-8 bg-card rounded-2xl p-4 shadow-card items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent grid place-items-center text-accent-foreground">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Match in 5 min</p>
              <p className="text-xs text-muted-foreground">Media nazionale</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, label: "Background check obbligatorio" },
    { icon: Heart, label: "Conforme GDPR" },
    { icon: Users, label: "Recensioni verificate" },
    { icon: Clock, label: "Supporto 7 giorni su 7" },
  ];
  return (
    <div className="border-y border-border/60 bg-secondary/40">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <it.icon className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesPreview() {
  return (
    <Section id="servizi">
      <SectionHeader
        eyebrow="Cinque servizi, una sola app"
        title={<>Tutto quello che serve <em className="italic text-primary">per la tua famiglia</em></>}
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
    { n: "01", title: "Racconta cosa cerchi", text: "Scegli il servizio, la zona e quando ti serve aiuto. Bastano 60 secondi." },
    { n: "02", title: "Scopri i profili giusti", text: "Sfoglia con il nostro swipe i profili verificati nella tua zona, con foto, video e recensioni reali." },
    { n: "03", title: "Conosci e prenota", text: "Chatta in app, fai una videocall conoscitiva, conferma. Contratto e pagamento gestiti per te." },
  ];

  return (
    <Section className="bg-secondary/30">
      <SectionHeader
        eyebrow="Come funziona"
        title={<>Tre passi. <span className="text-primary italic">Zero stress.</span></>}
        subtitle="Dimentica le settimane di ricerca. Con CareTinder trovi la persona giusta in pochi minuti."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="bg-card border border-border rounded-3xl p-7 relative overflow-hidden">
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

function Testimonials() {
  const items = [
    {
      img: t1,
      quote: "Cercavo da mesi una babysitter affidabile. Su CareTinder l'ho trovata in 2 giorni. Mia figlia la adora.",
      name: "Giulia M.",
      city: "Milano",
      service: "Babysitter",
    },
    {
      img: t3,
      quote: "Per mia mamma serviva una persona davvero competente. Le verifiche di CareTinder mi hanno dato pace.",
      name: "Anna R.",
      city: "Torino",
      service: "Badante",
    },
    {
      img: t2,
      quote: "Lavoro tanto e viaggio. Sapere che il mio cane è in buone mani vale ogni euro speso.",
      name: "Marco T.",
      city: "Roma",
      service: "Dog sitter",
    },
  ];

  return (
    <Section>
      <SectionHeader
        eyebrow="Testimonianze"
        title={<>Famiglie italiane <em className="italic text-primary">felici</em></>}
      />
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <figure key={it.name} className="bg-card border border-border rounded-3xl p-7 flex flex-col">
            <div className="flex items-center gap-1 text-primary mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="font-display text-lg leading-snug text-foreground flex-1">
              "{it.quote}"
            </blockquote>
            <figcaption className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
              <img src={it.img} alt={it.name} loading="lazy" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-sm">{it.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {it.city} · {it.service}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function Stats() {
  const stats = [
    { n: "5.000+", l: "Famiglie iscritte" },
    { n: "5.000+", l: "Professionisti verificati" },
    { n: "4.9/5", l: "Soddisfazione media" },
    { n: "5 min", l: "Tempo medio di match" },
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
      <div className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-warm rounded-[2rem] p-8 md:p-14 border border-border">
        <div>
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
            Iscrizione gratuita
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-[1.05]">
            Sii tra i primi a provare <span className="text-gradient-primary italic">CareTinder</span>.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Lasciaci la tua email e ti avvisiamo non appena CareTinder
            arriva nella tua città. Nessun pagamento richiesto.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {["Accesso prima del lancio pubblico", "1 mese gratis del piano Starter", "Niente impegno, niente spam"].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs">✓</span>
                {b}
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
