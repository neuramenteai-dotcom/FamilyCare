import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  userType: z.enum(["famiglia", "professionista"]).default("famiglia"),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  source: z.enum(["waitlist", "contact"]).default("waitlist"),
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
      });

      if (error) {
        // Duplicate email/source — treat as success (idempotent UX)
        if (error.code === "23505") {
          return { success: true, duplicate: true };
        }
        console.error("waitlist insert error:", error);
        return { success: false, error: "Impossibile salvare l'iscrizione." };
      }
      return { success: true };
    } catch (err) {
      console.error("waitlist handler error:", err);
      return { success: false, error: "Dati non validi." };
    }
  });
