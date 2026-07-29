import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth, requireAdmin } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";
import { PLANS, hasActivePlan, isPlanTier } from "@/lib/plans";

const MAX_SHORTLIST = 10;
const MAX_PRESENTED = 3;
const PRO_COLS = "id, full_name, city, experience, nationality, services, bio, avatar_url";

// --- FAMIGLIA (Premium): i profili selezionati e presentati da FamilyCare ---
export const getConciergeSelections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const family = await getOwnedWaitlistRecord(context.userId, {
        userType: "famiglia",
        columns: "id, plan_tier, subscription_status",
      });
      if (!family) return { success: false, error: "Profilo non trovato." };

      const tier = family.plan_tier as string | null;
      const active = hasActivePlan(tier, family.subscription_status as string | null);
      if (!active || !isPlanTier(tier) || !PLANS[tier].concierge) {
        // Non Premium: nessuna selezione concierge
        return { success: true, enabled: false, selections: [] };
      }

      const { data: sel } = await supabaseAdmin
        .from("concierge_selections")
        .select("professional_id, notes, rank")
        .eq("family_id", family.id)
        .eq("presented", true)
        .order("rank", { ascending: true });

      const proIds = (sel || []).map((s) => s.professional_id);
      const { data: pros } = proIds.length
        ? await supabaseAdmin.from("waitlist").select(PRO_COLS).in("id", proIds)
        : { data: [] as Record<string, unknown>[] };
      const byId = new Map((pros || []).map((p: Record<string, unknown>) => [p.id as string, p]));

      const selections = (sel || []).map((s) => {
        const p = byId.get(s.professional_id) as Record<string, unknown> | undefined;
        return {
          id: s.professional_id,
          notes: s.notes,
          full_name: p?.full_name ?? null,
          city: p?.city ?? null,
          experience: p?.experience ?? null,
          nationality: p?.nationality ?? null,
          services: p?.services ?? null,
          bio: p?.bio ?? null,
          avatar_url: p?.avatar_url ?? null,
        };
      });

      return { success: true, enabled: true, selections };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

// --- ADMIN: rosa concierge di una famiglia + professionisti disponibili ---
export const getConciergeData = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) => z.object({ familyId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { data: sel } = await supabaseAdmin
        .from("concierge_selections")
        .select("id, professional_id, presented, rank, notes")
        .eq("family_id", data.familyId)
        .order("created_at", { ascending: true });

      const selProIds = (sel || []).map((s) => s.professional_id);

      const { data: allPros } = await supabaseAdmin
        .from("waitlist")
        .select(PRO_COLS)
        .eq("user_type", "professionista")
        .in("status", ["pre_approvato", "attivo"])
        .order("score", { ascending: false });

      const byId = new Map(
        (allPros || []).map((p: Record<string, unknown>) => [p.id as string, p]),
      );

      const shortlist = (sel || []).map((s) => {
        const p = byId.get(s.professional_id) as Record<string, unknown> | undefined;
        return {
          selectionId: s.id,
          professionalId: s.professional_id,
          presented: s.presented,
          notes: s.notes,
          full_name: (p?.full_name as string | null) ?? null,
          city: (p?.city as string | null) ?? null,
          experience: (p?.experience as string | null) ?? null,
        };
      });

      const inShortlist = new Set(selProIds);
      const availablePros = (allPros || [])
        .filter((p: Record<string, unknown>) => !inShortlist.has(p.id as string))
        .map((p: Record<string, unknown>) => ({
          id: p.id as string,
          full_name: (p.full_name as string | null) ?? null,
          city: (p.city as string | null) ?? null,
          experience: (p.experience as string | null) ?? null,
        }));

      return { success: true, shortlist, availablePros };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

// --- ADMIN: aggiunge un professionista alla rosa (max 10) ---
export const addConciergeSelection = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z
      .object({
        familyId: z.string().uuid(),
        professionalId: z.string().uuid(),
        notes: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { count } = await supabaseAdmin
        .from("concierge_selections")
        .select("id", { count: "exact", head: true })
        .eq("family_id", data.familyId);
      if ((count || 0) >= MAX_SHORTLIST) {
        return { success: false, error: `Massimo ${MAX_SHORTLIST} profili nella rosa.` };
      }

      const { error } = await supabaseAdmin.from("concierge_selections").insert({
        family_id: data.familyId,
        professional_id: data.professionalId,
        notes: data.notes ?? null,
      });
      if (error) {
        if (error.code === "23505") return { success: false, error: "Profilo già in rosa." };
        throw error;
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

export const removeConciergeSelection = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) => z.object({ selectionId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { error } = await supabaseAdmin
        .from("concierge_selections")
        .delete()
        .eq("id", data.selectionId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

// --- ADMIN: presenta/nasconde un profilo alla famiglia (max 3 presentati) ---
export const setPresented = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z.object({ selectionId: z.string().uuid(), presented: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { data: sel } = await supabaseAdmin
        .from("concierge_selections")
        .select("id, family_id")
        .eq("id", data.selectionId)
        .maybeSingle();
      if (!sel) return { success: false, error: "Selezione non trovata." };

      if (data.presented) {
        const { count } = await supabaseAdmin
          .from("concierge_selections")
          .select("id", { count: "exact", head: true })
          .eq("family_id", sel.family_id)
          .eq("presented", true);
        if ((count || 0) >= MAX_PRESENTED) {
          return {
            success: false,
            error: `Puoi presentare al massimo ${MAX_PRESENTED} profili.`,
          };
        }
      }

      const { error } = await supabaseAdmin
        .from("concierge_selections")
        .update({ presented: data.presented })
        .eq("id", data.selectionId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });
