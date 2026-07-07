import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-05-27.dahlia", // Usa una versione recente
});

const PRICE_AMOUNT = 2900; // Legacy fallback amount
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID; // The Price ID for the subscription in Stripe Dashboard

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      returnUrl: z.string().url(),
    }),
  )
  .handler(async ({ data, context }) => {
    try {
      if (!stripeSecretKey) {
        return { success: false, error: "Stripe non è configurato sul server." };
      }

      // The family is derived from the authenticated session
      const record = await getOwnedWaitlistRecord(context.userId, {
        userType: "famiglia",
        columns: "id, email, full_name, has_active_package",
      });

      if (!record) {
        return { success: false, error: "Famiglia non trovata." };
      }

      if (record.has_active_package) {
        return { success: false, error: "Pacchetto già attivo." };
      }

      let lineItems;
      let mode: "subscription" | "payment" = "subscription";

      if (STRIPE_PRICE_ID) {
        lineItems = [{ price: STRIPE_PRICE_ID, quantity: 1 }];
      } else {
        // Fallback to one-time payment if no price ID is configured
        console.warn("STRIPE_PRICE_ID missing. Fallback to one-time payment mode.");
        mode = "payment";
        lineItems = [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Pacchetto Mensile FamilyCare",
                description: "Abbonamento mensile per contatti illimitati.",
              },
              unit_amount: PRICE_AMOUNT,
            },
            quantity: 1,
          },
        ];
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode,
        customer_email: record.email as string,
        line_items: lineItems,
        metadata: {
          familyId: record.id,
        },
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

// Conferma UX dopo il redirect da Stripe. La fonte di verità per
// l'attivazione del pacchetto è il webhook (src/routes/api/stripe-webhook.ts):
// questa funzione aggiorna subito lo stato solo per l'utente proprietario.
export const verifyCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      sessionId: z.string().max(500),
    }),
  )
  .handler(async ({ data, context }) => {
    try {
      if (!stripeSecretKey) {
        return { success: false, error: "Stripe non è configurato sul server." };
      }

      const record = await getOwnedWaitlistRecord(context.userId, { userType: "famiglia" });
      if (!record) {
        return { success: false, error: "Famiglia non trovata." };
      }

      const session = await stripe.checkout.sessions.retrieve(data.sessionId);

      // The session must belong to this family
      if (session.metadata?.familyId !== record.id) {
        return { success: false, error: "Sessione non valida." };
      }

      if (session.payment_status === "paid") {
        const { error } = await supabaseAdmin
          .from("waitlist")
          .update({ has_active_package: true })
          .eq("id", record.id);

        if (error) {
          console.error("Error updating family package after payment:", error);
          return {
            success: false,
            error: "Pagamento ricevuto, ma errore nell'aggiornamento del database.",
          };
        }

        return { success: true, has_active_package: true };
      }

      return { success: true, has_active_package: false };
    } catch (err) {
      console.error("Stripe Verify Error:", err);
      return { success: false, error: "Sessione non trovata o errore di verifica." };
    }
  });
