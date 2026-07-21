import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isPlanTier } from "@/lib/plans";

// Fonte di verità per l'abbonamento famiglia. Configurazione: endpoint Stripe su
// /api/stripe-webhook con gli eventi checkout.session.completed,
// customer.subscription.updated/deleted, invoice.paid, invoice.payment_failed,
// e STRIPE_WEBHOOK_SECRET nell'env.

type SubStatus = "active" | "past_due" | "canceled";

function mapStatus(s: string): SubStatus {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  return "canceled"; // canceled, incomplete, incomplete_expired, paused
}

function periodEndIso(sub: Stripe.Subscription): string | null {
  const top = (sub as any).current_period_end as number | undefined;
  const item = sub.items?.data?.[0] as any;
  const unix = top ?? item?.current_period_end;
  return typeof unix === "number" ? new Date(unix * 1000).toISOString() : null;
}

// Trova la riga famiglia da aggiornare, provando in ordine: metadata.familyId,
// stripe_subscription_id, stripe_customer_id.
async function resolveFamilyId(opts: {
  familyId?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
}): Promise<string | null> {
  if (opts.familyId) return opts.familyId;
  if (opts.subscriptionId) {
    const { data } = await supabaseAdmin
      .from("waitlist")
      .select("id")
      .eq("stripe_subscription_id", opts.subscriptionId)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  if (opts.customerId) {
    const { data } = await supabaseAdmin
      .from("waitlist")
      .select("id")
      .eq("stripe_customer_id", opts.customerId)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  return null;
}

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

        const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-05-27.dahlia" as any });

        let event: Stripe.Event;
        try {
          const payload = await request.text();
          event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
        } catch (err) {
          console.error("Stripe webhook signature verification failed:", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;
              const tier = session.metadata?.tier;
              const familyId = await resolveFamilyId({
                familyId: session.metadata?.familyId,
                subscriptionId:
                  typeof session.subscription === "string" ? session.subscription : null,
                customerId: typeof session.customer === "string" ? session.customer : null,
              });

              if (familyId && isPlanTier(tier)) {
                const { error } = await supabaseAdmin
                  .from("waitlist")
                  .update({
                    plan_tier: tier,
                    subscription_status: "active",
                    has_active_package: true,
                    stripe_customer_id:
                      typeof session.customer === "string" ? session.customer : null,
                    stripe_subscription_id:
                      typeof session.subscription === "string" ? session.subscription : null,
                  })
                  .eq("id", familyId);
                if (error) throw error;
              }
              break;
            }

            case "customer.subscription.updated": {
              const sub = event.data.object as Stripe.Subscription;
              const status = mapStatus(sub.status);
              const tier = sub.metadata?.tier;
              const familyId = await resolveFamilyId({
                familyId: sub.metadata?.familyId,
                subscriptionId: sub.id,
                customerId: typeof sub.customer === "string" ? sub.customer : null,
              });
              if (familyId) {
                const { error } = await supabaseAdmin
                  .from("waitlist")
                  .update({
                    subscription_status: status,
                    has_active_package: status === "active",
                    plan_current_period_end: periodEndIso(sub),
                    ...(isPlanTier(tier) ? { plan_tier: tier } : {}),
                    stripe_subscription_id: sub.id,
                  })
                  .eq("id", familyId);
                if (error) throw error;
              }
              break;
            }

            case "customer.subscription.deleted": {
              const sub = event.data.object as Stripe.Subscription;
              const familyId = await resolveFamilyId({
                familyId: sub.metadata?.familyId,
                subscriptionId: sub.id,
                customerId: typeof sub.customer === "string" ? sub.customer : null,
              });
              if (familyId) {
                const { error } = await supabaseAdmin
                  .from("waitlist")
                  .update({
                    subscription_status: "canceled",
                    plan_tier: null,
                    has_active_package: false,
                  })
                  .eq("id", familyId);
                if (error) throw error;
              }
              break;
            }

            case "invoice.paid": {
              const invoice = event.data.object as Stripe.Invoice;
              const subscriptionId =
                typeof (invoice as any).subscription === "string"
                  ? ((invoice as any).subscription as string)
                  : null;
              const familyId = await resolveFamilyId({
                subscriptionId,
                customerId: typeof invoice.customer === "string" ? invoice.customer : null,
              });
              if (familyId) {
                const { error } = await supabaseAdmin
                  .from("waitlist")
                  .update({ subscription_status: "active", has_active_package: true })
                  .eq("id", familyId);
                if (error) throw error;
              }
              break;
            }

            case "invoice.payment_failed": {
              const invoice = event.data.object as Stripe.Invoice;
              const subscriptionId =
                typeof (invoice as any).subscription === "string"
                  ? ((invoice as any).subscription as string)
                  : null;
              const familyId = await resolveFamilyId({
                subscriptionId,
                customerId: typeof invoice.customer === "string" ? invoice.customer : null,
              });
              if (familyId) {
                const { error } = await supabaseAdmin
                  .from("waitlist")
                  .update({ subscription_status: "past_due" })
                  .eq("id", familyId);
                if (error) throw error;
              }
              break;
            }
          }
        } catch (err) {
          console.error("Stripe webhook handler error:", err);
          // 500 => Stripe ritenta la consegna dell'evento
          return new Response("Handler error", { status: 500 });
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
