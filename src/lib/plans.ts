// Configurazione centralizzata dei piani famiglia. Riutilizzata da billing,
// visibilità profili e limiti di contatto.

export type PlanTier = "base" | "plus" | "premium";

export interface PlanConfig {
  tier: PlanTier;
  label: string;
  priceLabel: string;
  priceEnv: string; // nome della env var con lo Stripe Price ID
  contactCap: number; // Infinity = illimitati
  showVerificationBadges: boolean;
  videoCalls: boolean; // Fase 2
  concierge: boolean; // Fase 4
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  base: {
    tier: "base",
    label: "Base",
    priceLabel: "29,99€",
    priceEnv: "STRIPE_PRICE_BASE",
    contactCap: 5,
    showVerificationBadges: false,
    videoCalls: false,
    concierge: false,
  },
  plus: {
    tier: "plus",
    label: "Plus",
    priceLabel: "49,99€",
    priceEnv: "STRIPE_PRICE_PLUS",
    contactCap: 20,
    showVerificationBadges: true,
    videoCalls: true,
    concierge: false,
  },
  premium: {
    tier: "premium",
    label: "Premium",
    priceLabel: "79,99€",
    priceEnv: "STRIPE_PRICE_PREMIUM",
    contactCap: Infinity,
    showVerificationBadges: true,
    videoCalls: true,
    concierge: true,
  },
};

export const PLAN_TIERS: PlanTier[] = ["base", "plus", "premium"];

export function isPlanTier(v: unknown): v is PlanTier {
  return v === "base" || v === "plus" || v === "premium";
}

// Un abbonamento è "attivo" se ha un tier e lo stato è active.
export function hasActivePlan(
  planTier: string | null | undefined,
  status: string | null | undefined,
): boolean {
  return isPlanTier(planTier) && status === "active";
}
