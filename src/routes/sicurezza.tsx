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
          "Documento d'identità verificato prima della pubblicazione, bollini di verifica aggiuntivi, videochiamata conoscitiva e conformità GDPR.",
      },
      { property: "og:title", content: "Sicurezza Family Care" },
      {
        property: "og:description",
        content:
          "Nessun profilo è visibile prima che il documento d'identità sia stato verificato dal nostro team.",
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
            Nessun profilo diventa visibile alle famiglie prima che il documento d'identità sia
            stato controllato dal nostro team. Qui sotto trovi esattamente cosa verifichiamo — e
            cosa no.
          </p>
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: FileCheck,
              title: "1. Documento d'identità verificato",
              text: "Obbligatorio per tutti. Il professionista carica carta d'identità o passaporto, il nostro team li controlla e solo dopo il profilo diventa visibile alle famiglie.",
            },
            {
              icon: ShieldCheck,
              title: "2. Bollini di verifica aggiuntivi",
              text: "Casellario giudiziale, lettere di referenza e attestati formativi. Chi li carica ottiene un bollino visibile sul profilo. Sono volontari: non tutti i profili li hanno, e vedi sempre quali mancano.",
            },
            {
              icon: UserCheck,
              title: "3. Videochiamata conoscitiva",
              text: "Con i piani Plus e Premium parli in video con il professionista dentro la piattaforma, prima di decidere. Senza scambiarvi il numero privato.",
            },
            {
              icon: Star,
              title: "4. Selezione assistita",
              text: "Con il piano Premium il nostro team esamina fino a 10 profili verificati e te ne presenta 3, spiegando perché proprio quelli.",
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

      <Section>
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-primary shrink-0" />
            <h2 className="font-display text-2xl font-semibold">Cosa non verifichiamo</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Preferiamo dirtelo prima. Un documento d'identità verificato conferma che la persona è
            chi dice di essere: non è una garanzia sul suo comportamento, sulle sue capacità
            professionali o sull'esito del rapporto di lavoro. Non svolgiamo indagini investigative,
            non verifichiamo lo stato di salute e non sostituiamo il colloquio che farai tu.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Il casellario giudiziale e le referenze sono documenti che il professionista sceglie di
            caricare: quando il bollino non c'è, significa che quel documento non è stato fornito.
            Family Care mette in contatto famiglie e professionisti, ma non è datore di lavoro e non
            è parte del rapporto che nascerà tra voi: la decisione finale, e il contratto, restano
            vostri.
          </p>
        </div>
      </Section>

      <Section className="bg-secondary/40">
        <SectionHeader eyebrow="Privacy" title="I tuoi dati sono solo tuoi" />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              t: "Conformi al GDPR",
              d: "Dati ospitati su infrastruttura in UE. Puoi chiedere accesso, rettifica o cancellazione dei tuoi dati quando vuoi.",
            },
            {
              icon: ShieldCheck,
              t: "Pagamenti sicuri",
              d: "Tutte le transazioni passano da Stripe. Family Care non vede mai i dati della tua carta.",
            },
            {
              icon: UserCheck,
              t: "Assistenza in italiano",
              d: "Scrivici dalla pagina contatti: rispondiamo entro 24 ore lavorative.",
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
