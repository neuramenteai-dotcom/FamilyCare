import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";

export const getFamilyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      // 1. Get family profile (owned by the authenticated user)
      const family = await getOwnedWaitlistRecord(context.userId, { userType: "famiglia" });
      if (!family) {
        return { success: false, error: "Profilo non trovato" };
      }

      // 2. Fetch professionals for the Teaser or Full view
      const { data: allProfessionals, error: proError } = await supabaseAdmin
        .from("waitlist")
        .select("id, full_name, city, experience, nationality, italian_level, services, message, avatar_url, bio")
        .eq("user_type", "professionista")
        .in("status", ["pre_approvato", "attivo"])
        .order("created_at", { ascending: false });

      if (proError) {
        console.error("Errore query professionisti:", proError);
        return { success: false, error: "Errore nel caricamento professionisti" };
      }

      // If no active package, return locked state with TEASER professionals
      if (!family.has_active_package) {
        const teaserProfessionals = (allProfessionals || []).map((p: any) => ({
          id: p.id,
          full_name: p.full_name?.split(' ')[0] || "Professionista", // Only first name
          city: p.city,
          experience: p.experience,
          avatar_url: p.avatar_url,
          // We intentionally leave out bio, email, nationality, services, etc.
        }));

        return {
          success: true,
          locked: true,
          familyId: family.id,
          full_name: family.full_name,
          professionals: teaserProfessionals // Add this to feed the teaser view
        };
      }

      // 3. Family is unlocked, return full professionals
      const professionals = allProfessionals;

      // 4. Fetch matches (professionals who liked this family)
      const { data: interests, error: intError } = await supabaseAdmin
        .from("professional_interests")
        .select("professional_id")
        .eq("family_id", family.id)
        .eq("status", "like");

      let matches: any[] = [];
      if (!intError && interests && interests.length > 0) {
        const proIds = interests.map(i => i.professional_id);
        const { data: matchedPros } = await supabaseAdmin
          .from("waitlist")
          // Included email for direct contact + bio + avatar
          .select("id, full_name, city, experience, nationality, italian_level, services, message, email, avatar_url, bio")
          .in("id", proIds);
        if (matchedPros) {
          matches = matchedPros;
        }
      }

      return { success: true, locked: false, professionals, matches, familyId: family.id, full_name: family.full_name };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });

export const getProDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      // 1. Get pro profile (owned by the authenticated user)
      const pro = await getOwnedWaitlistRecord(context.userId, { userType: "professionista" });
      if (!pro) {
        return { success: false, error: "Profilo non trovato" };
      }

      // 2. If status is not attivo, return locked
      if (pro.status !== "attivo") {
        return { success: true, locked: true, proId: pro.id, status: pro.status, full_name: pro.full_name };
      }

      // 3. Fetch family requests
      const { data: families, error: famError } = await supabaseAdmin
        .from("waitlist")
        .select("id, city, services, frequency, urgency, message")
        .eq("user_type", "famiglia")
        .eq("has_active_package", true) // Solo famiglie paganti
        .order("created_at", { ascending: false });

      if (famError) {
        return { success: false, error: "Errore nel caricamento richieste" };
      }

      // 4. Fetch current likes/dislikes
      const { data: interests } = await supabaseAdmin
        .from("professional_interests")
        .select("family_id, status")
        .eq("professional_id", pro.id);

      return {
        success: true,
        locked: false,
        families,
        interests: interests || [],
        proId: pro.id,
        full_name: pro.full_name
      };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });

export const setProInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({
    familyId: z.string().uuid(),
    status: z.enum(["like", "dislike"])
  }).parse(input))
  .handler(async ({ data, context }) => {
    try {
      // The professional is derived from the session, never from the client
      const pro = await getOwnedWaitlistRecord(context.userId, { userType: "professionista" });
      if (!pro) {
        return { success: false, error: "Profilo professionista non trovato" };
      }
      if (pro.status !== "attivo") {
        return { success: false, error: "Profilo non ancora attivo" };
      }

      const { error } = await supabaseAdmin
        .from("professional_interests")
        .upsert({
          professional_id: pro.id,
          family_id: data.familyId,
          status: data.status
        }, { onConflict: 'professional_id, family_id' });

      if (error) {
        console.error("Set interest error:", error);
        return { success: false, error: "Errore nel salvataggio" };
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });

export const updateFamilyRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      services: z.array(z.string()).max(10),
      frequency: z.string().max(100),
      urgency: z.string().max(100),
      message: z.string().max(2000).optional()
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    try {
      const family = await getOwnedWaitlistRecord(context.userId, { userType: "famiglia" });
      if (!family) {
        return { success: false, error: "Profilo non trovato" };
      }

      const { error } = await supabaseAdmin
        .from("waitlist")
        .update({
          services: data.services,
          frequency: data.frequency,
          urgency: data.urgency,
          message: data.message || ""
        })
        .eq("id", family.id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || "Errore durante l'aggiornamento" };
    }
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const record = await getOwnedWaitlistRecord(context.userId, {
        columns: "id, bio, avatar_url, full_name, user_type",
      });
      if (!record) {
        return { success: false, error: "Profilo non trovato" };
      }
      return {
        success: true,
        profile: {
          id: record.id,
          bio: (record.bio as string | null) || "",
          avatar_url: (record.avatar_url as string | null) || null,
          full_name: record.full_name,
          user_type: record.user_type,
        },
      };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      bio: z.string().max(2000),
      avatar_url: z.string().url().max(1000).nullable(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    try {
      const record = await getOwnedWaitlistRecord(context.userId);
      if (!record) {
        return { success: false, error: "Profilo non trovato" };
      }

      const { error } = await supabaseAdmin
        .from("waitlist")
        .update({ bio: data.bio, avatar_url: data.avatar_url })
        .eq("id", record.id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || "Errore durante il salvataggio" };
    }
  });
