import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/Section";
import { SERVICES } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/servizi")({
  head: () => ({
    meta: [
      { title: "Servizi — Babysitter, Badanti, Colf, Dog sitter, Tutor | Family Care" },
      {
        name: "description",
        content:
          "Scopri i 5 servizi di Family Care: babysitter, badanti, colf, dog sitter e tutor. Professionisti verificati, prezzi trasparenti, contratto incluso.",
      },
      { property: "og:title", content: "I servizi Family Care" },
      {
        property: "og:description",
        content: "5 categorie di servizi alla famiglia con professionisti verificati in tutta Italia.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <Section className="bg-gradient-hero pt-20 pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
            I nostri servizi
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
            Cinque modi di prenderci cura della tua famiglia
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Tutti i nostri professionisti passano un processo di verifica in 4 step:
            documenti, referenze, colloquio e background check.
          </p>
        </div>
      </Section>

      {SERVICES.map((s, i) => (
        <Section key={s.slug} id={s.slug} className={i % 2 === 1 ? "bg-secondary/30" : ""}>
          <div className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="rounded-3xl overflow-hidden shadow-card aspect-[4/3]">
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-primary">
                Servizio {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 font-display text-3xl md:text-5xl font-semibold leading-[1.05]">
                {s.name}
              </h2>
              <p className="mt-3 text-xl text-primary font-medium italic">{s.tagline}</p>
              <p className="mt-4 text-muted-foreground leading-relaxed">{s.description}</p>

              <ul className="mt-6 space-y-2.5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-primary-soft text-primary grid place-items-center shrink-0">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <div className="rounded-2xl bg-card border border-border px-5 py-3">
                  <p className="text-xs text-muted-foreground">A partire da</p>
                  <p className="font-display text-2xl font-semibold text-primary">{s.priceFrom}/h</p>
                </div>
                <div className="rounded-2xl bg-card border border-border px-5 py-3">
                  <p className="text-xs text-muted-foreground">Disponibilità</p>
                  <p className="font-display text-lg font-semibold">{s.available}</p>
                </div>
              </div>

              <Button asChild className="mt-7 rounded-full h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/" hash="iscriviti">
                  Cerca {s.name.toLowerCase()} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
