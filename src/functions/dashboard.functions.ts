import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";
import { PLANS, hasActivePlan, isPlanTier, type PlanTier } from "@/lib/plans";

// Calcola l'età (anni interi) da una data ISO YYYY-MM-DD.
function computeAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 120 ? age : null;
}

export const getFamilyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      // 1. Profilo famiglia (con dati abbonamento)
      const family = await getOwnedWaitlistRecord(context.userId, {
        userType: "famiglia",
        columns: "id, full_name, plan_tier, subscription_status",
      });
      if (!family) {
        return { success: false, error: "Profilo non trovato" };
      }

      const planTier = family.plan_tier as string | null;
      const subStatus = family.subscription_status as string | null;
      const active = hasActivePlan(planTier, subStatus);
      const tier = (active && isPlanTier(planTier) ? planTier : null) as PlanTier | null;

      // 2. Tutti i professionisti visibili
      const { data: allPros, error: proError } = await supabaseAdmin
        .from("waitlist")
        .select(
          "id, full_name, city, experience, nationality, italian_level, services, bio, avatar_url, birth_date, gender, video_url, email, criminal_check_verified, references_verified, certificates_verified",
        )
        .eq("user_type", "professionista")
        .in("status", ["pre_approvato", "attivo"])
        .order("created_at", { ascending: false });

      if (proError) {
        console.error("Errore query professionisti:", proError);
        return { success: false, error: "Errore nel caricamento professionisti" };
      }
      const pros = allPros || [];

      // 3. Stato bloccato: teaser (nessun abbonamento attivo)
      if (!tier) {
        const teaser = pros.map((p) => ({
          id: p.id,
          first_name: p.full_name?.split(" ")[0] || "Professionista",
          city: p.city,
          experience: p.experience,
          avatar_url: p.avatar_url,
        }));
        return {
          success: true,
          locked: true,
          tier: null,
          familyId: family.id,
          full_name: family.full_name,
          professionals: teaser,
        };
      }

      const plan = PLANS[tier];

      // 4. Contatti già usati e conversazioni aperte
      const [{ data: contacts }, { data: convos }, { data: interests }] = await Promise.all([
        supabaseAdmin.from("family_contacts").select("professional_id").eq("family_id", family.id),
        supabaseAdmin
          .from("conversations")
          .select("id, professional_id")
          .eq("family_id", family.id),
        supabaseAdmin
          .from("professional_interests")
          .select("professional_id")
          .eq("family_id", family.id)
          .eq("status", "like"),
      ]);

      const contactedIds = new Set((contacts || []).map((c) => c.professional_id));
      const convoByPro = new Map((convos || []).map((c) => [c.professional_id, c.id]));
      const likedByPro = new Set((interests || []).map((i) => i.professional_id));

      // 5. Profili con campi visibili in base al tier
      const professionals = pros.map((p) => {
        const contacted = contactedIds.has(p.id);
        return {
          id: p.id,
          // Nome intero + email svelati solo dopo il contatto
          first_name: p.full_name?.split(" ")[0] || "Professionista",
          full_name: contacted ? p.full_name : null,
          email: contacted ? p.email : null,
          conversationId: convoByPro.get(p.id) || null,
          contacted,
          likedByPro: likedByPro.has(p.id),
          age: computeAge(p.birth_date),
          nationality: p.nationality,
          experience: p.experience,
          italian_level: p.italian_level,
          services: p.services,
          city: p.city,
          gender: p.gender,
          bio: p.bio,
          video_url: p.video_url,
          avatar_url: p.avatar_url,
          badges: plan.showVerificationBadges
            ? {
                criminal: p.criminal_check_verified,
                references: p.references_verified,
                certificates: p.certificates_verified,
              }
            : null,
        };
      });

      return {
        success: true,
        locked: false,
        tier,
        familyId: family.id,
        full_name: family.full_name,
        professionals,
        contactsUsed: contactedIds.size,
        contactsCap: Number.isFinite(plan.contactCap) ? plan.contactCap : null, // null = illimitati
      };
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
        return {
          success: true,
          locked: true,
          proId: pro.id,
          status: pro.status,
          full_name: pro.full_name,
        };
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
        full_name: pro.full_name,
      };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server" };
    }
  });

export const setProInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        familyId: z.string().uuid(),
        status: z.enum(["like", "dislike"]),
      })
      .parse(input),
  )
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

      const { error } = await supabaseAdmin.from("professional_interests").upsert(
        {
          professional_id: pro.id,
          family_id: data.familyId,
          status: data.status,
        },
        { onConflict: "professional_id, family_id" },
      );

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

// Una famiglia "contatta" un professionista: rispetta il cap del tier, crea il
// record di contatto e apre la conversazione. Ritorna id conversazione + email.
export const contactProfessional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ professionalId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    try {
      const family = await getOwnedWaitlistRecord(context.userId, {
        userType: "famiglia",
        columns: "id, plan_tier, subscription_status",
      });
      if (!family) {
        return { success: false, error: "Profilo non trovato" };
      }

      const active = hasActivePlan(
        family.plan_tier as string | null,
        family.subscription_status as string | null,
      );
      const tier = family.plan_tier as string | null;
      if (!active || !isPlanTier(tier)) {
        return { success: false, error: "Serve un abbonamento attivo per contattare i profili." };
      }

      // Il professionista deve esistere ed essere attivo/pre-approvato
      const { data: pro } = await supabaseAdmin
        .from("waitlist")
        .select("id, email, full_name")
        .eq("id", data.professionalId)
        .eq("user_type", "professionista")
        .in("status", ["pre_approvato", "attivo"])
        .maybeSingle();
      if (!pro) {
        return { success: false, error: "Professionista non trovato" };
      }

      // Già contattato? Ritorna la conversazione esistente
      const { data: existing } = await supabaseAdmin
        .from("family_contacts")
        .select("id")
        .eq("family_id", family.id)
        .eq("professional_id", pro.id)
        .maybeSingle();

      if (!existing) {
        // Verifica il cap del tier
        const cap = PLANS[tier].contactCap;
        if (Number.isFinite(cap)) {
          const { count } = await supabaseAdmin
            .from("family_contacts")
            .select("id", { count: "exact", head: true })
            .eq("family_id", family.id);
          if ((count || 0) >= cap) {
            return {
              success: false,
              error: `Hai raggiunto il limite di ${cap} contatti del tuo piano. Passa a un piano superiore per contattarne altri.`,
            };
          }
        }
        const { error: insErr } = await supabaseAdmin
          .from("family_contacts")
          .insert({ family_id: family.id, professional_id: pro.id });
        if (insErr) throw insErr;
      }

      // Apre (o riusa) la conversazione
      const { data: convo, error: convErr } = await supabaseAdmin
        .from("conversations")
        .upsert(
          { family_id: family.id, professional_id: pro.id },
          { onConflict: "family_id, professional_id" },
        )
        .select("id")
        .single();
      if (convErr) throw convErr;

      return {
        success: true,
        conversationId: convo.id,
        email: pro.email,
        full_name: pro.full_name,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Errore del server",
      };
    }
  });

export const updateFamilyRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        services: z.array(z.string()).max(10),
        frequency: z.string().max(100),
        urgency: z.string().max(100),
        message: z.string().max(2000).optional(),
      })
      .parse(input),
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
          message: data.message || "",
        })
        .eq("id", family.id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Errore durante l'aggiornamento",
      };
    }
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const record = await getOwnedWaitlistRecord(context.userId, {
        columns: "id, bio, avatar_url, full_name, user_type, gender, video_url",
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
          gender: (record.gender as string | null) || "",
          video_url: (record.video_url as string | null) || "",
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
    z
      .object({
        bio: z.string().max(2000),
        avatar_url: z.string().url().max(1000).nullable(),
        gender: z.string().max(30).optional(),
        video_url: z.string().url().max(1000).or(z.literal("")).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      const record = await getOwnedWaitlistRecord(context.userId);
      if (!record) {
        return { success: false, error: "Profilo non trovato" };
      }

      const { error } = await supabaseAdmin
        .from("waitlist")
        .update({
          bio: data.bio,
          avatar_url: data.avatar_url,
          gender: data.gender ?? null,
          video_url: data.video_url ? data.video_url : null,
        })
        .eq("id", record.id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Errore durante il salvataggio",
      };
    }
  });
