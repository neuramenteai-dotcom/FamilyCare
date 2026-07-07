import { supabaseAdmin } from "@/integrations/supabase/client.server";

type UserType = "famiglia" | "professionista";

/**
 * Carica la riga waitlist appartenente all'utente autenticato.
 * Ritorna null se non esiste (o se il tipo utente non corrisponde).
 */
export async function getOwnedWaitlistRecord(
  userId: string,
  options: { userType?: UserType; columns?: string } = {},
) {
  let query = supabaseAdmin
    .from("waitlist")
    .select(options.columns || "id, status, full_name, user_type, has_active_package")
    .eq("auth_id", userId);

  if (options.userType) {
    query = query.eq("user_type", options.userType);
  }

  const { data, error } = await query.single();
  if (error || !data) {
    return null;
  }
  return data as unknown as {
    id: string;
    status: string | null;
    full_name: string | null;
    user_type: string | null;
    has_active_package: boolean | null;
    [key: string]: unknown;
  };
}
