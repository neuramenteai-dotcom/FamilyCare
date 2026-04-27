import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SERVICE_VALUES = [
  "babysitter",
  "badanti",
  "colf",
  "dogsitter",
  "tutor",
] as const;

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
  birth_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { error } = await supabaseAdmin.from("waitlist").insert({
        email: data.email,
        full_name: data.full_name || null,
        user_type: data.userType,
        city: data.city || null,
        message: data.message || null,
        source: data.source,
        phone: data.phone || null,
        services: data.services && data.services.length > 0 ? data.services : null,
        frequency: data.frequency || null,
        urgency: data.urgency || null,
        experience: data.experience || null,
        italian_level: data.italian_level || null,
        nationality: data.nationality || null,
        birth_date: data.birth_date || null,
      });

      if (error) {
        if (error.code === "23505") {
          return { success: true, duplicate: true };
        }
        console.error("waitlist insert error:", error);
        return { success: false, error: "Impossibile salvare l'iscrizione." };
      }
      return { success: true };
    } catch (err) {
      console.error("waitlist handler error:", err);
      return { success: false, error: "Dati non validi. Controlla i campi." };
    }
  });
