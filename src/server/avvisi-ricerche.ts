import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { hasActivePlan } from "@/lib/plans";
import { sendAvvisoRicercaSalvata } from "@/server/email";

/** La citta' puo' essere salvata come "Roma (Prati)": qui serve la citta' base. */
function cittaBase(citta: string | null): string {
  if (!citta) return "";
  return citta
    .replace(/\s*\(.*\)\s*$/, "")
    .trim()
    .toLowerCase();
}

/**
 * Avvisa le famiglie le cui ricerche salvate combaciano con un professionista
 * appena approvato. Va chiamata SOLO dopo che il profilo e' diventato visibile.
 *
 * Non e' una funzione server esposta al client: la invoca l'approvazione admin.
 */
export async function avvisaRicercheCorrispondenti(professionalId: string): Promise<number> {
  try {
    const { data: pro } = await supabaseAdmin
      .from("waitlist")
      .select("id, city, services, status, user_type")
      .eq("id", professionalId)
      .maybeSingle();

    if (!pro || pro.user_type !== "professionista" || pro.status !== "attivo") return 0;

    const cittaPro = cittaBase(pro.city);
    if (!cittaPro) return 0;
    const serviziPro = (pro.services as string[] | null) || [];

    const { data: ricerche } = await supabaseAdmin
      .from("ricerche_salvate")
      .select("id, nome, citta, zona, servizi, family_id")
      .eq("attiva", true);

    if (!ricerche?.length) return 0;

    // Una ricerca combacia se la citta' coincide e almeno un servizio si
    // sovrappone; una ricerca senza servizi accetta qualunque categoria.
    const corrispondenti = ricerche.filter((r) => {
      if (cittaBase(r.citta) !== cittaPro) return false;
      const serviziRicerca = (r.servizi as string[] | null) || [];
      if (serviziRicerca.length === 0) return true;
      return serviziRicerca.some((s) => serviziPro.includes(s));
    });
    if (!corrispondenti.length) return 0;

    const famiglieIds = [...new Set(corrispondenti.map((r) => r.family_id))];
    const { data: famiglie } = await supabaseAdmin
      .from("waitlist")
      .select("id, email, full_name, plan_tier, access_expires_at")
      .in("id", famiglieIds);

    const perId = new Map((famiglie || []).map((f) => [f.id, f]));
    let inviate = 0;

    for (const r of corrispondenti) {
      const f = perId.get(r.family_id);
      if (!f?.email) continue;
      // Un accesso scaduto non riceve avvisi: sarebbe pubblicita' non richiesta.
      if (!hasActivePlan(f.plan_tier as string | null, f.access_expires_at as string | null)) {
        continue;
      }

      await sendAvvisoRicercaSalvata({
        email: f.email as string,
        nomeFamiglia: (f.full_name as string | null) ?? null,
        nomeRicerca: r.nome as string,
        citta: r.citta as string,
        zona: (r.zona as string | null) ?? null,
      });
      inviate++;

      await supabaseAdmin
        .from("ricerche_salvate")
        .update({ ultima_notifica_at: new Date().toISOString() })
        .eq("id", r.id);
    }

    return inviate;
  } catch (err) {
    console.error("Avviso ricerche salvate fallito:", err);
    return 0;
  }
}
