import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { PLAN_TIERS, PLANS, type PlanTier } from "@/lib/plans";

const FEATURES: Record<PlanTier, string[]> = {
  base: [
    "Vedi tutti i profili disponibili (età, nazionalità, esperienza, specializzazione, zona, video)",
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

export function PlanSelector({
  onChoose,
  loadingTier,
}: {
  onChoose: (tier: PlanTier) => void;
  loadingTier: PlanTier | null;
}) {
  return (
    <div className="mb-10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Scegli il tuo piano</h2>
        <p className="text-muted-foreground">
          Abbonamento mensile, disdici quando vuoi. Sblocca i profili verificati nella tua zona.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {PLAN_TIERS.map((tier) => {
          const plan = PLANS[tier];
          const highlighted = tier === "plus";
          return (
            <div
              key={tier}
              className={`rounded-3xl border p-6 flex flex-col bg-background shadow-sm ${
                highlighted ? "border-primary border-2" : "border-border/60"
              }`}
            >
              {highlighted && (
                <div className="self-start bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                  PIÙ SCELTO
                </div>
              )}
              <h3 className="font-display text-xl font-bold">{plan.label}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{plan.priceLabel}</span>
                <span className="text-muted-foreground">/mese</span>
              </div>
              <ul className="space-y-2 text-sm flex-grow mb-6">
                {FEATURES[tier].map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full h-12 rounded-xl"
                variant={highlighted ? "default" : "secondary"}
                onClick={() => onChoose(tier)}
                disabled={loadingTier !== null}
              >
                {loadingTier === tier ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Scegli {plan.label}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
