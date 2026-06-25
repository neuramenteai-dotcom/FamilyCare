import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const getFamilyDashboard = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ authId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    try {
      // 1. Get family profile
      const { data: family, error: familyError } = await supabaseAdmin
        .from("waitlist")
        .select("id, has_active_package, full_name")
        .eq("auth_id", data.authId)
        .single();

      if (familyError || !family) {
        return { success: false, error: "Profilo non trovato" };
      }

      // 2. If no active package, return locked state
      if (!family.has_active_package) {
        return { success: true, locked: true, familyId: family.id, full_name: family.full_name };
      }

      // 3. Fetch professionals
      const { data: professionals, error: proError } = await supabaseAdmin
        .from("waitlist")
        .select("id, full_name, city, experience, nationality, italian_level, services, message, documenti")
        .eq("user_type", "professionista")
        .in("status", ["pre_approvato", "attivo"])
        .order("created_at", { ascending: false });

      if (proError) {
        return { success: false, error: "Errore nel caricamento professionisti" };
      }

      return { success: true, locked: false, professionals, familyId: family.id, full_name: family.full_name };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });

export const getProDashboard = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ authId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    try {
      // 1. Get pro profile
      const { data: pro, error: proError } = await supabaseAdmin
        .from("waitlist")
        .select("id, status, full_name")
        .eq("auth_id", data.authId)
        .single();

      if (proError || !pro) {
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
      const { data: interests, error: intError } = await supabaseAdmin
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
  .validator((input: unknown) => z.object({
    proId: z.string(),
    familyId: z.string(),
    status: z.enum(["like", "dislike"])
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { error } = await supabaseAdmin
        .from("professional_interests")
        .upsert({
          professional_id: data.proId,
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
