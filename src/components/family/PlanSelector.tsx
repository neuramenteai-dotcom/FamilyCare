import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { PLAN_TIERS, PLANS, type PlanTier } from "@/lib/plans";

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
                <span className="text-5xl font-bold">{plan.priceLabel}</span>
                <span
                  className={`ml-1 text-sm ${highlighted ? "text-white/90" : "text-muted-foreground"}`}
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
