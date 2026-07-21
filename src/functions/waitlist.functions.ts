import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "@/integrations/supabase/auth-middleware";

const SERVICE_VALUES = ["babysitter", "badanti", "colf", "dogsitter", "tutor"] as const;

const Schema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  userType: z.enum(["famiglia", "professionista"]).default("famiglia"),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  source: z.enum(["waitlist", "contact", "famiglia_form", "pro_form"]).default("waitlist"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  services: z.array(z.enum(SERVICE_VALUES)).max(5).optional(),
  frequency: z.string().trim().max(60).optional().or(z.literal("")),
  urgency: z.string().trim().max(60).optional().or(z.literal("")),
  experience: z.string().trim().max(40).optional().or(z.literal("")),
  italian_level: z.string().trim().max(40).optional().or(z.literal("")),
  nationality: z.string().trim().max(60).optional().or(z.literal("")),
  birth_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  gender: z.string().trim().max(30).optional().or(z.literal("")),
  video_url: z.string().trim().url().max(1000).optional().or(z.literal("")),
  zona: z.string().trim().max(100).optional().or(z.literal("")),
  documenti: z.array(z.string()).optional(),
  competenze: z.array(z.string()).optional(),
  disponibilita: z.array(z.string()).optional(),
  auth_id: z.string().uuid().optional(),
  // Consenso (GDPR): l'accettazione di privacy/termini è obbligatoria per
  // procedere; il consenso marketing è separato e facoltativo.
  privacy_accepted: z.literal(true),
  marketing_consent: z.boolean().default(false),
  consent_policy_version: z.string().min(1).max(20),
});

export const joinWaitlist = createServerFn({ method: "POST" })
  .validator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    try {
      // Calculate Quality Score (0-100)
      let score = 0;
      if (data.userType === "famiglia") {
        if (data.full_name && data.full_name.trim().length > 0) score += 15;
        if (data.phone && data.phone.trim().length > 0) score += 20;
        if (data.email && data.email.trim().length > 0) score += 10;
        if (data.city && data.city.trim().length > 0) score += 15;
        if (data.services && data.services.length > 0) score += 15;
        if (data.urgency && data.urgency.toLowerCase().includes("urgente")) score += 15;
        if (data.message && data.message.trim().length > 20) score += 10;
      } else {
        if (data.full_name && data.full_name.trim().length > 0) score += 15;
        if (data.phone && data.phone.trim().length > 0) score += 20;
        if (data.email && data.email.trim().length > 0) score += 5;
        if (data.nationality && data.nationality.trim().length > 0) score += 10;
        if (data.services && data.services.length > 0) score += 15;
        if (data.experience) {
          if (
            data.experience.includes("5") ||
            data.experience.includes("10") ||
            data.experience.includes("Più")
          ) {
            score += 15;
          } else if (data.experience.includes("3")) {
            score += 10;
          }
        }
        if (
          data.italian_level &&
          (data.italian_level.includes("Ottimo") || data.italian_level.includes("madrelingua"))
        ) {
          score += 10;
        }
        if (data.message && data.message.trim().length > 50) score += 15;
      }
      score = Math.min(100, score);

      // Format City and Message with Multi-step fields
      let finalCity = data.city || null;
      if (data.zona) {
        finalCity = finalCity ? `${finalCity} (${data.zona})` : data.zona;
      }

      let finalMessage = data.message || "";
      if (data.userType === "professionista") {
        const proDetails = [];
        if (data.documenti && data.documenti.length > 0) {
          proDetails.push(`Documenti: ${data.documenti.join(", ")}`);
        }
        if (data.competenze && data.competenze.length > 0) {
          proDetails.push(`Competenze: ${data.competenze.join(", ")}`);
        }
        if (data.disponibilita && data.disponibilita.length > 0) {
          proDetails.push(`Disponibilità: ${data.disponibilita.join(", ")}`);
        }
        if (proDetails.length > 0) {
          finalMessage = `${proDetails.join("\n")}\n\nPresentazione:\n${finalMessage}`;
        }
      }

      const { data: insertedData, error } = await supabaseAdmin
        .from("waitlist")
        .insert({
          email: data.email,
          full_name: data.full_name || null,
          user_type: data.userType,
          city: finalCity,
          message: finalMessage || null,
          source: data.source,
          phone: data.phone || null,
          services: data.services && data.services.length > 0 ? data.services : null,
          frequency: data.frequency || null,
          urgency: data.urgency || null,
          experience: data.experience || null,
          italian_level: data.italian_level || null,
          nationality: data.nationality || null,
          birth_date: data.birth_date || null,
          gender: data.gender || null,
          video_url: data.video_url || null,
          status: "nuovo",
          score,
          auth_id: data.auth_id || null,
          privacy_accepted_at: new Date().toISOString(),
          marketing_consent: data.marketing_consent,
          marketing_consent_at: data.marketing_consent ? new Date().toISOString() : null,
          consent_policy_version: data.consent_policy_version,
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505") {
          // L'email esiste già nel database (waitlist).
          // Se l'utente in fase di test ha cancellato e ricreato l'account Auth,
          // aggiorniamo l'auth_id nel record waitlist esistente per riallinearli.
          if (data.auth_id) {
            await supabaseAdmin
              .from("waitlist")
              .update({ auth_id: data.auth_id })
              .eq("email", data.email);
          }
          return { success: true, duplicate: true };
        }
        console.error(
          "waitlist insert error — code:",
          error.code,
          "| message:",
          error.message,
          "| details:",
          error.details,
          "| hint:",
          error.hint,
        );
        return { success: false, error: "Impossibile salvare l'iscrizione." };
      }

      // Double opt-in: l'email NON viene auto-confermata. L'utente deve
      // cliccare il link di conferma inviato da Supabase (emailRedirectTo →
      // /conferma-email) prima di poter accedere. Questo rende il consenso e
      // la titolarità dell'indirizzo dimostrabili.

      // Invia notifiche email in background
      try {
        const { sendEmailNotification } = await import("@/server/email");
        await sendEmailNotification({
          email: data.email,
          full_name: data.full_name || undefined,
          userType: data.userType,
          city: data.city || undefined,
          phone: data.phone || undefined,
          services: data.services,
          message: data.message || undefined,
          zona: data.zona || undefined,
          experience: data.experience || undefined,
          italian_level: data.italian_level || undefined,
          nationality: data.nationality || undefined,
          birth_date: data.birth_date || undefined,
          gender: data.gender || undefined,
          video_url: data.video_url || undefined,
          score,
        });
      } catch (emailErr) {
        console.error("Failed to send email notifications:", emailErr);
      }

      return { success: true, id: insertedData?.id };
    } catch (err) {
      console.error("waitlist handler error:", err);
      return { success: false, error: "Dati non validi. Controlla i campi." };
    }
  });

export const getWaitlist = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from("waitlist")
        .select("*, has_active_package")
        .order("score", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("fetch waitlist error:", error);
        return { success: false, error: "Impossibile recuperare i dati." };
      }
      return { success: true, data };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

export const updateFamilyPackage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        has_active_package: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { error } = await supabaseAdmin
        .from("waitlist")
        .update({ has_active_package: data.has_active_package })
        .eq("id", data.id);

      if (error) {
        console.error("update package error:", error);
        return { success: false, error: "Impossibile aggiornare pacchetto." };
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

export const updateWaitlistStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["nuovo", "contattato", "in_verifica", "pre_approvato", "attivo"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { error } = await supabaseAdmin
        .from("waitlist")
        .update({ status: data.status })
        .eq("id", data.id);

      if (error) {
        console.error("update waitlist status error:", error);
        return { success: false, error: "Impossibile aggiornare lo stato." };
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

// Il bucket identity_docs è privato: l'admin ottiene un signed URL temporaneo
// a partire dal path salvato in waitlist.id_front_url.
export const getIdentityDocUrl = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) => z.object({ path: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { data: signed, error } = await supabaseAdmin.storage
        .from("identity_docs")
        .createSignedUrl(data.path, 60 * 10); // 10 minuti

      if (error || !signed?.signedUrl) {
        console.error("signed url error:", error);
        return { success: false, error: "Impossibile generare il link al documento." };
      }
      return { success: true, url: signed.signedUrl };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });
