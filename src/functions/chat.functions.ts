import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";
import { PLANS, hasActivePlan, isPlanTier } from "@/lib/plans";

// Carica il record waitlist dell'utente autenticato (famiglia o professionista).
async function getMyRecord(userId: string) {
  return getOwnedWaitlistRecord(userId, {
    columns: "id, full_name, user_type, avatar_url",
  });
}

// Verifica che l'utente sia partecipante della conversazione e la ritorna.
async function getParticipantConversation(userId: string, conversationId: string) {
  const me = await getMyRecord(userId);
  if (!me) return { me: null, conversation: null };
  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select("id, family_id, professional_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation) return { me, conversation: null };
  const isParticipant = conversation.family_id === me.id || conversation.professional_id === me.id;
  return { me, conversation: isParticipant ? conversation : null };
}

export const getConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const me = await getMyRecord(context.userId);
      if (!me) return { success: false, error: "Profilo non trovato" };

      const { data: convos, error } = await supabaseAdmin
        .from("conversations")
        .select("id, family_id, professional_id, created_at")
        .or(`family_id.eq.${me.id},professional_id.eq.${me.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Info dell'altra parte per ciascuna conversazione
      const otherIds = Array.from(
        new Set(
          (convos || []).map((c) => (c.family_id === me.id ? c.professional_id : c.family_id)),
        ),
      );
      const { data: others } = otherIds.length
        ? await supabaseAdmin
            .from("waitlist")
            .select("id, full_name, avatar_url")
            .in("id", otherIds)
        : { data: [] as { id: string; full_name: string | null; avatar_url: string | null }[] };
      const otherById = new Map((others || []).map((o) => [o.id, o]));

      const conversations = (convos || []).map((c) => {
        const otherId = c.family_id === me.id ? c.professional_id : c.family_id;
        const other = otherById.get(otherId);
        return {
          id: c.id,
          otherName: other?.full_name || "Utente",
          otherAvatar: other?.avatar_url || null,
          created_at: c.created_at,
        };
      });

      return { success: true, conversations, myAuthId: context.userId };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });

export const getMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ conversationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    try {
      const { me, conversation } = await getParticipantConversation(
        context.userId,
        data.conversationId,
      );
      if (!me) return { success: false, error: "Profilo non trovato" };
      if (!conversation) return { success: false, error: "Conversazione non accessibile" };

      const { data: messages, error } = await supabaseAdmin
        .from("messages")
        .select("id, sender_auth_id, body, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;

      // La videochiamata è abilitata se la famiglia della conversazione ha un piano video
      const { data: family } = await supabaseAdmin
        .from("waitlist")
        .select("plan_tier, subscription_status")
        .eq("id", conversation.family_id)
        .maybeSingle();
      const tier = family?.plan_tier;
      const videoEnabled =
        hasActivePlan(tier, family?.subscription_status) &&
        isPlanTier(tier) &&
        PLANS[tier].videoCalls;

      return {
        success: true,
        messages: messages || [],
        myAuthId: context.userId,
        videoEnabled,
      };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        conversationId: z.string().uuid(),
        body: z.string().trim().min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      const { me, conversation } = await getParticipantConversation(
        context.userId,
        data.conversationId,
      );
      if (!me) return { success: false, error: "Profilo non trovato" };
      if (!conversation) return { success: false, error: "Conversazione non accessibile" };

      const { data: message, error } = await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_auth_id: context.userId,
          body: data.body,
        })
        .select("id, sender_auth_id, body, created_at")
        .single();
      if (error) throw error;

      return { success: true, message };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });
