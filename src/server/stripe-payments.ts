import type Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isPlanTier, PLANS, type PlanTier } from "@/lib/plans";

/** Accredita una sessione pagata tramite la RPC idempotente del database.
 * Webhook e redirect possono invocarla entrambi: la sessione Stripe viene
 * applicata una sola volta, anche se Stripe ritenta la consegna dell'evento.
 */
export async function accreditaCheckoutPagato(session: Stripe.Checkout.Session) {
  if (
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid"
  ) {
    return { granted: false, tier: null as PlanTier | null };
  }

  const familyId = session.metadata?.familyId;
  const tierValue = session.metadata?.tier;
  if (!familyId || !isPlanTier(tierValue)) {
    throw new Error(`Checkout ${session.id} privo di metadata famiglia/piano validi.`);
  }

  const expectedAmount = PLANS[tierValue].priceCents;
  if (session.currency !== "eur" || session.amount_total !== expectedAmount) {
    throw new Error(
      `Importo o valuta non coerenti per checkout ${session.id}: ${session.amount_total} ${session.currency}.`,
    );
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;
  const { data, error } = await supabaseAdmin.rpc("grant_family_access_for_checkout", {
    p_checkout_session_id: session.id,
    p_family_id: familyId,
    p_tier: tierValue,
    p_payment_intent_id: paymentIntentId,
    p_amount_total: session.amount_total,
    p_currency: session.currency,
  });
  if (error) throw error;

  return { granted: data === true, tier: tierValue };
}
