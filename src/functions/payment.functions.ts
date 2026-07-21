import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";
import { PLANS, type PlanTier } from "@/lib/plans";

function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  return secretKey ? new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" as any }) : null;
}

function priceIdForTier(tier: PlanTier): string | undefined {
  return process.env[PLANS[tier].priceEnv];
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      tier: z.enum(["base", "plus", "premium"]),
      returnUrl: z.string().url(),
    }),
  )
  .handler(async ({ data, context }) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return { success: false, error: "Stripe non è configurato sul server." };
      }

      const priceId = priceIdForTier(data.tier);
      if (!priceId) {
        return {
          success: false,
          error: `Prezzo Stripe non configurato per il piano ${data.tier} (${PLANS[data.tier].priceEnv}).`,
        };
      }

      // La famiglia è derivata dalla sessione autenticata
      const record = await getOwnedWaitlistRecord(context.userId, {
        userType: "famiglia",
        columns: "id, email, full_name, subscription_status, stripe_customer_id",
      });

      if (!record) {
        return { success: false, error: "Famiglia non trovata." };
      }

      if (record.subscription_status === "active") {
        return { success: false, error: "Hai già un abbonamento attivo." };
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        // Riusa il customer se esiste (abilita il Customer Portal); altrimenti lo crea Stripe
        ...(record.stripe_customer_id
          ? { customer: record.stripe_customer_id as string }
          : { customer_email: record.email as string }),
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { familyId: record.id, tier: data.tier },
        subscription_data: { metadata: { familyId: record.id, tier: data.tier } },
        success_url: `${data.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: data.returnUrl,
      });

      return { success: true, url: session.url };
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Errore durante la creazione del pagamento.",
      };
    }
  });

// Portale di gestione abbonamento (aggiorna metodo di pagamento, disdici, ecc.)
export const createBillingPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ returnUrl: z.string().url() }))
  .handler(async ({ data, context }) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return { success: false, error: "Stripe non è configurato sul server." };
      }

      const record = await getOwnedWaitlistRecord(context.userId, {
        userType: "famiglia",
        columns: "id, stripe_customer_id",
      });
      if (!record?.stripe_customer_id) {
        return { success: false, error: "Nessun abbonamento da gestire." };
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: record.stripe_customer_id as string,
        return_url: data.returnUrl,
      });

      return { success: true, url: session.url };
    } catch (err) {
      console.error("Stripe Billing Portal Error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Errore nell'apertura del portale.",
      };
    }
  });

// Conferma UX dopo il redirect da Stripe. La fonte di verità per l'attivazione
// dell'abbonamento è il webhook; questa aggiorna subito lo stato del proprietario.
export const verifyCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ sessionId: z.string().max(500) }))
  .handler(async ({ data, context }) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return { success: false, error: "Stripe non è configurato sul server." };
      }

      const record = await getOwnedWaitlistRecord(context.userId, { userType: "famiglia" });
      if (!record) {
        return { success: false, error: "Famiglia non trovata." };
      }

      const session = await stripe.checkout.sessions.retrieve(data.sessionId);

      if (session.metadata?.familyId !== record.id) {
        return { success: false, error: "Sessione non valida." };
      }

      const tier = session.metadata?.tier;
      if (
        session.payment_status === "paid" &&
        (tier === "base" || tier === "plus" || tier === "premium")
      ) {
        const { error } = await supabaseAdmin
          .from("waitlist")
          .update({
            plan_tier: tier,
            subscription_status: "active",
            has_active_package: true,
            stripe_customer_id:
              typeof session.customer === "string"
                ? session.customer
                : ((record.stripe_customer_id as string | null) ?? null),
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : null,
          })
          .eq("id", record.id);

        if (error) {
          console.error("Error updating family plan after payment:", error);
          return {
            success: false,
            error: "Pagamento ricevuto, ma errore nell'aggiornamento del database.",
          };
        }

        return { success: true, plan_tier: tier };
      }

      return { success: true, plan_tier: null };
    } catch (err) {
      console.error("Stripe Verify Error:", err);
      return { success: false, error: "Sessione non trovata o errore di verifica." };
    }
  });
