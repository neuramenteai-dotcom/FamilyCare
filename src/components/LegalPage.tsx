import { ReactNode } from "react";
import { POLICY_VERSION } from "@/lib/legal";

// Layout condiviso per le pagine legali (privacy, cookie, termini):
// intestazione, contenitore leggibile e nota di versione/aggiornamento.
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-3xl px-4 lg:px-8 py-16 md:py-24">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
          Documenti legali
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-semibold leading-[1.1] text-foreground">
          {title}
        </h1>
        {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
        <p className="mt-2 text-sm text-muted-foreground">
          Ultimo aggiornamento: versione {POLICY_VERSION}
        </p>

        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200">
          <strong>Bozza da completare.</strong> Questo documento è un modello da rivedere con un
          consulente legale e da integrare con i dati del titolare del trattamento prima della
          pubblicazione definitiva.
        </div>

        <div className="mt-10 space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
