import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";
import { PLANS, hasActivePlan, isPlanTier } from "@/lib/plans";

const DAILY_API = "https://api.daily.co/v1";

async function dailyFetch(path: string, init: RequestInit, apiKey: string) {
  const res = await fetch(`${DAILY_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  return res;
}

// Crea (o riusa) la stanza video per una conversazione e ritorna URL + token.
// La videochiamata è riservata alle conversazioni la cui famiglia ha un piano
// Plus o Premium attivo.
export const createVideoRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ conversationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    try {
      const apiKey = process.env.DAILY_API_KEY;
      if (!apiKey) {
        return { success: false, error: "Videochiamate non configurate sul server." };
      }

      // Verifica partecipazione
      const me = await getOwnedWaitlistRecord(context.userId, {
        columns: "id, full_name, user_type",
      });
      if (!me) return { success: false, error: "Profilo non trovato." };

      const { data: convo } = await supabaseAdmin
        .from("conversations")
        .select("id, family_id, professional_id")
        .eq("id", data.conversationId)
        .maybeSingle();
      if (!convo || (convo.family_id !== me.id && convo.professional_id !== me.id)) {
        return { success: false, error: "Conversazione non accessibile." };
      }

      // Gating: la famiglia della conversazione deve avere un piano con videochiamate
      const { data: family } = await supabaseAdmin
        .from("waitlist")
        .select("plan_tier, subscription_status")
        .eq("id", convo.family_id)
        .maybeSingle();
      const tier = family?.plan_tier;
      const active = hasActivePlan(tier, family?.subscription_status);
      if (!active || !isPlanTier(tier) || !PLANS[tier].videoCalls) {
        return {
          success: false,
          error: "Le videochiamate sono disponibili con i piani Plus e Premium.",
        };
      }

      const roomName = `fc-${data.conversationId}`;
      const expUnix = Math.floor(Date.now() / 1000) + 2 * 3600; // 2 ore

      // Crea la stanza privata (se già esiste, la riusiamo con GET)
      let roomUrl: string | null = null;
      const createRes = await dailyFetch(
        "/rooms",
        {
          method: "POST",
          body: JSON.stringify({
            name: roomName,
            privacy: "private",
            properties: {
              exp: expUnix,
              eject_at_room_exp: true,
              enable_screenshare: true,
              enable_chat: false,
            },
          }),
        },
        apiKey,
      );
      if (createRes.ok) {
        roomUrl = (await createRes.json()).url;
      } else {
        // Probabilmente esiste già: recuperala
        const getRes = await dailyFetch(`/rooms/${roomName}`, { method: "GET" }, apiKey);
        if (getRes.ok) {
          roomUrl = (await getRes.json()).url;
        } else {
          console.error("Daily room error:", await createRes.text());
          return { success: false, error: "Impossibile creare la stanza video." };
        }
      }

      // Token di accesso per l'utente corrente
      const tokenRes = await dailyFetch(
        "/meeting-tokens",
        {
          method: "POST",
          body: JSON.stringify({
            properties: {
              room_name: roomName,
              user_name: (me.full_name as string | null) || "Utente",
              exp: expUnix,
            },
          }),
        },
        apiKey,
      );
      if (!tokenRes.ok) {
        console.error("Daily token error:", await tokenRes.text());
        return { success: false, error: "Impossibile generare il token video." };
      }
      const token = (await tokenRes.json()).token as string;

      return { success: true, roomUrl, token };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });
