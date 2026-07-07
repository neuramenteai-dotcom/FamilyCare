import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/Section";
import { ShieldCheck, FileCheck, UserCheck, Lock, Star, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/sicurezza")({
  head: () => ({
    meta: [
      { title: "Sicurezza e verifiche — Come proteggiamo la tua famiglia | Family Care" },
      {
        name: "description",
        content:
          "Background check, documenti verificati, referenze controllate, conformità GDPR. Scopri come Family Care rende sicura ogni prenotazione.",
      },
      { property: "og:title", content: "Sicurezza Family Care" },
      {
        property: "og:description",
        content: "Ogni professionista passa 4 livelli di verifica prima di entrare su Family Care.",
      },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <>
      <Section className="bg-gradient-hero pt-20 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
            Sicurezza
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
            La fiducia non si chiede,
            <br />
            <em className="italic text-primary">si dimostra.</em>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Ogni persona che entra in casa tua è stata verificata da noi, in 4 step, prima di poter
            ricevere il primo "swipe".
          </p>
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: FileCheck,
              title: "1. Documenti certificati",
              text: "Carta d'identità, codice fiscale e permesso di soggiorno (se applicabile) verificati uno per uno dal nostro team.",
            },
            {
              icon: UserCheck,
              title: "2. Colloquio personale",
              text: "Ogni candidato fa un colloquio in videochiamata con un nostro operatore. Niente bot, niente automatismi.",
            },
            {
              icon: Star,
              title: "3. Referenze contattate",
              text: "Chiamiamo direttamente almeno 2 referenze precedenti per ogni profilo. Le valutazioni le scriviamo noi.",
            },
            {
              icon: ShieldCheck,
              title: "4. Background check",
              text: "Controllo del casellario giudiziale per i ruoli di assistenza a minori e anziani. Aggiornato annualmente.",
            },
          ].map((it) => (
            <div key={it.title} className="bg-card border border-border rounded-3xl p-7">
              <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground grid place-items-center mb-4">
                <it.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{it.title}</h3>
              <p className="text-sm text-muted-foreground">{it.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <SectionHeader eyebrow="Privacy" title="I tuoi dati sono solo tuoi" />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              t: "Conformi al GDPR",
              d: "Server in Europa. Cifratura end-to-end delle conversazioni. Diritto all'oblio in 1 click.",
            },
            {
              icon: ShieldCheck,
              t: "Pagamenti sicuri",
              d: "Tutte le transazioni passano da Stripe. Family Care non vede mai i dati della tua carta.",
            },
            {
              icon: AlertTriangle,
              t: "Supporto 7/7",
              d: "Squadra dedicata in italiano, raggiungibile via chat dalle 8:00 alle 22:00, sempre.",
            },
          ].map((it) => (
            <div key={it.t} className="bg-card rounded-3xl p-7 border border-border">
              <it.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">{it.t}</h3>
              <p className="text-sm text-muted-foreground">{it.d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
