import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";
import { PLANS, hasActivePlan, isPlanTier } from "@/lib/plans";

const SERVIZI = ["babysitter", "badanti", "colf", "dogsitter", "tutor"] as const;

const MAX_RICERCHE = 10;

/** Carica la famiglia autenticata e verifica che abbia le ricerche salvate. */
async function famigliaConRicerche(userId: string) {
  const family = await getOwnedWaitlistRecord(userId, {
    userType: "famiglia",
    columns: "id, email, full_name, plan_tier, access_expires_at",
  });
  if (!family) return { family: null, abilitata: false };

  const tier = family.plan_tier as string | null;
  const attivo = hasActivePlan(tier, family.access_expires_at as string | null);
  const abilitata = attivo && isPlanTier(tier) && PLANS[tier].savedSearches;
  return { family, abilitata };
}

export const getRicercheSalvate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { family, abilitata } = await famigliaConRicerche(context.userId);
      if (!family) return { success: false as const, error: "Profilo non trovato." };
      if (!abilitata) {
        return { success: true as const, abilitata: false, ricerche: [] };
      }

      const { data, error } = await supabaseAdmin
        .from("ricerche_salvate")
        .select("id, nome, citta, zona, servizi, attiva, created_at")
        .eq("family_id", family.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return { success: true as const, abilitata: true, ricerche: data || [] };
    } catch (err) {
      console.error(err);
      return { success: false as const, error: "Errore del server." };
    }
  });

export const creaRicercaSalvata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        nome: z.string().trim().min(2).max(60),
        citta: z.string().trim().min(2).max(80),
        zona: z.string().trim().max(100).optional().or(z.literal("")),
        servizi: z.array(z.enum(SERVIZI)).max(5),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      const { family, abilitata } = await famigliaConRicerche(context.userId);
      if (!family) return { success: false, error: "Profilo non trovato." };
      if (!abilitata) {
        return {
          success: false,
          error: "Le ricerche salvate sono incluse nell'Accesso Plus.",
        };
      }

      const { count } = await supabaseAdmin
        .from("ricerche_salvate")
        .select("id", { count: "exact", head: true })
        .eq("family_id", family.id);
      if ((count || 0) >= MAX_RICERCHE) {
        return {
          success: false,
          error: `Puoi tenere al massimo ${MAX_RICERCHE} ricerche salvate. Eliminane una per crearne un'altra.`,
        };
      }

      const { data: creata, error } = await supabaseAdmin
        .from("ricerche_salvate")
        .insert({
          family_id: family.id,
          nome: data.nome,
          citta: data.citta,
          zona: data.zona || null,
          servizi: data.servizi,
        })
        .select("id, nome, citta, zona, servizi, attiva, created_at")
        .single();
      if (error) throw error;

      return { success: true, ricerca: creata };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

export const eliminaRicercaSalvata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    try {
      const family = await getOwnedWaitlistRecord(context.userId, {
        userType: "famiglia",
        columns: "id",
      });
      if (!family) return { success: false, error: "Profilo non trovato." };

      // Il vincolo su family_id impedisce di cancellare la ricerca di un altro.
      const { error } = await supabaseAdmin
        .from("ricerche_salvate")
        .delete()
        .eq("id", data.id)
        .eq("family_id", family.id);
      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });
