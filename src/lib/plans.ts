// Configurazione centralizzata degli accessi famiglia.
//
// Il modello non e' un abbonamento ricorrente ma un ACCESSO A TEMPO: una
// famiglia cerca, trova e smette. Vendere un abbonamento a chi resta uno o due
// mesi produce solo disdette dimenticate e rimborsi; un accesso di 30 giorni
// dice la verita' sull'uso reale e si puo' prezzare meglio, perche' non porta
// con se' la paura di restare agganciati.
//
// Cosa si paga: gli STRUMENTI (chat, video, ricerche salvate), mai il numero di
// persone che puoi contattare. Vendere accesso misurato a lavoratori avvicina
// l'attivita' all'intermediazione di manodopera, che e' regolata e richiede
// autorizzazione. I contatti sono quindi illimitati a ogni livello.
//
// Cosa resta gratis: tutte le informazioni di SICUREZZA. Chi guarda un profilo
// vede i bollini di verifica senza pagare nulla. Dietro l'accesso stanno la
// profondita' (video, biografia completa) e la comunicazione, mai la sicurezza.

export const ABBONAMENTI_ATTIVI = false;

// Giorni di validita' di un accesso acquistato.
export const DURATA_ACCESSO_GIORNI = 30;

export type PlanTier = "base" | "plus";

export interface PlanConfig {
  tier: PlanTier;
  label: string;
  priceLabel: string;
  priceEnv: string; // nome della env var con lo Stripe Price ID
  videoCalls: boolean;
  savedSearches: boolean;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  base: {
    tier: "base",
    label: "Accesso",
    priceLabel: "39€",
    priceEnv: "STRIPE_PRICE_BASE",
    videoCalls: false,
    savedSearches: false,
  },
  plus: {
    tier: "plus",
    label: "Accesso Plus",
    priceLabel: "59€",
    priceEnv: "STRIPE_PRICE_PLUS",
    videoCalls: true,
    savedSearches: true,
  },
};

export const PLAN_TIERS: PlanTier[] = ["base", "plus"];

export function isPlanTier(v: unknown): v is PlanTier {
  return v === "base" || v === "plus";
}

/**
 * Un accesso e' attivo se ha un livello valido e la scadenza non e' passata.
 * La fonte di verita' e' la data, non lo stato di un abbonamento Stripe.
 */
export function hasActivePlan(
  planTier: string | null | undefined,
  accessExpiresAt: string | null | undefined,
): boolean {
  if (!isPlanTier(planTier) || !accessExpiresAt) return false;
  const scadenza = new Date(accessExpiresAt).getTime();
  return Number.isFinite(scadenza) && scadenza > Date.now();
}

/** Giorni interi mancanti alla scadenza, 0 se gia' scaduto. */
export function giorniRimanenti(accessExpiresAt: string | null | undefined): number {
  if (!accessExpiresAt) return 0;
  const ms = new Date(accessExpiresAt).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0;
}
