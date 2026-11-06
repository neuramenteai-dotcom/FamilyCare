import { ABBONAMENTI_ATTIVI } from "@/lib/plans";

function normalizzaEmail(email: string | null | undefined): string {
  return (email || "").trim().toLowerCase();
}

/**
 * Durante il pre-lancio Stripe resta chiuso al pubblico. Gli indirizzi presenti
 * nel secret TEST_CHECKOUT_EMAILS possono però completare un collaudo end-to-end
 * senza rendere disponibile il checkout a chi visita il sito.
 */
export function canStartCheckout(email: string | null | undefined): boolean {
  if (ABBONAMENTI_ATTIVI) return true;

  const indirizzo = normalizzaEmail(email);
  if (!indirizzo) return false;

  const whitelist = (process.env.TEST_CHECKOUT_EMAILS || "")
    .split(",")
    .map(normalizzaEmail)
    .filter(Boolean);

  return whitelist.includes(indirizzo);
}
