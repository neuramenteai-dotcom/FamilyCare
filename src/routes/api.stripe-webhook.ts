import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Fonte di verità per l'attivazione del pacchetto famiglia dopo il pagamento.
// Configurazione: endpoint nel dashboard Stripe puntato a /api/stripe-webhook
// con l'evento checkout.session.completed, e STRIPE_WEBHOOK_SECRET nell'env.
export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!stripeSecretKey || !webhookSecret) {
          console.error("Stripe webhook: STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET mancanti.");
          return new Response("Webhook not configured", { status: 500 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("Missing stripe-signature header", { status: 400 });
        }

        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: "2026-05-27.dahlia",
        });

        let event: Stripe.Event;
        try {
          const payload = await request.text();
          // constructEventAsync: su Cloudflare Workers la verifica firma è async
          event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
        } catch (err) {
          console.error("Stripe webhook signature verification failed:", err);
          return new Response("Invalid signature", { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const familyId = session.metadata?.familyId;

          if (session.payment_status === "paid" && familyId) {
            const { error } = await supabaseAdmin
              .from("waitlist")
              .update({ has_active_package: true })
              .eq("id", familyId);

            if (error) {
              console.error("Stripe webhook: errore aggiornamento pacchetto famiglia:", error);
              // 500 => Stripe ritenta la consegna dell'evento
              return new Response("Database update failed", { status: 500 });
            }
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
