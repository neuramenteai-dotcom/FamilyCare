import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-05-27.dahlia", // Usa una versione recente
});

const PRICE_AMOUNT = 2900; // 29.00 EUR in cents

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator(z.object({
    familyId: z.string(),
    returnUrl: z.string(),
  }))
  .handler(async ({ data }) => {
    try {
      if (!stripeSecretKey) {
        return { success: false, error: "Stripe non è configurato sul server." };
      }

      // Check if user exists
      const { data: record, error } = await supabaseAdmin
        .from("waitlist")
        .select("id, email, full_name, has_active_package")
        .eq("id", data.familyId)
        .single();

      if (error || !record) {
        return { success: false, error: "Famiglia non trovata." };
      }

      if (record.has_active_package) {
        return { success: false, error: "Pacchetto già attivo." };
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: record.email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Pacchetto Sblocco Profili Famiglia",
                description: "Accesso immediato a tutti i profili verificati dei professionisti nella tua zona.",
              },
              unit_amount: PRICE_AMOUNT,
            },
            quantity: 1,
          },
        ],
        metadata: {
          familyId: data.familyId,
        },
        success_url: `${data.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: data.returnUrl,
      });

      return { success: true, url: session.url };
    } catch (err: any) {
      console.error("Stripe Checkout Error:", err);
      return { success: false, error: err.message || "Errore durante la creazione del pagamento." };
    }
  });

export const verifyCheckoutSession = createServerFn({ method: "POST" })
  .validator(z.object({
    sessionId: z.string(),
  }))
  .handler(async ({ data }) => {
    try {
      if (!stripeSecretKey) {
        return { success: false, error: "Stripe non è configurato sul server." };
      }

      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      
      if (session.payment_status === "paid") {
        const familyId = session.metadata?.familyId;
        
        if (familyId) {
          // Update database
          const { error } = await supabaseAdmin
            .from("waitlist")
            .update({ has_active_package: true })
            .eq("id", familyId);

          if (error) {
            console.error("Error updating family package after payment:", error);
            return { success: false, error: "Pagamento ricevuto, ma errore nell'aggiornamento del database." };
          }

          return { success: true, has_active_package: true };
        }
      }

      return { success: true, has_active_package: false };
    } catch (err: any) {
      console.error("Stripe Verify Error:", err);
      return { success: false, error: "Sessione non trovata o errore di verifica." };
    }
  });
