import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";

function getStripeClient(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  return new Stripe(secret, { apiVersion: "2026-05-27.dahlia" as any });
}

/**
 * Registra l'esito di una verifica d'identita' esterna.
 *
 * Non pubblica il profilo: lo porta a "pre_approvato", cioe' documento
 * controllato e in attesa che una persona lo guardi. La pubblicazione resta un
 * gesto umano, fatto da updateWaitlistStatus, che e' anche l'unico punto da
 * cui partono gli avvisi delle ricerche salvate: pubblicare da qui le
 * salterebbe in silenzio.
 *
 * Un profilo gia' "attivo" non viene retrocesso: chi rifa' la verifica non
 * deve ritrovarsi nascosto alle famiglie.
 */
async function registraIdentitaVerificata(
  waitlistId: string,
  metodo: "stripe_identity",
  sessionId: string,
  statoAttuale: string | null,
) {
  const campi: Record<string, unknown> = {
    identity_verified: true,
    verification_method: metodo,
    verified_at: new Date().toISOString(),
    identity_session_id: sessionId,
  };
  if (statoAttuale !== "attivo") {
    campi.status = "pre_approvato";
  }
  return supabaseAdmin
    .from("waitlist")
    .update(campi as never)
    .eq("id", waitlistId);
}

/**
 * 1. Crea una sessione Stripe Identity per la verifica di documenti internazionali + biometria
 * Zero memorizzazione di documenti d'identità sui nostri server.
 */
export const createStripeIdentitySession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        returnUrl: z.string().url(),
      })
      .parse(input),
  )
  .handler(async ({ data: input, context }) => {
    try {
      const stripe = getStripeClient();
      if (!stripe) {
        return { success: false, error: "Stripe non è configurato nell'ambiente." };
      }

      const user = await getOwnedWaitlistRecord(context.userId, {
        columns: "id, full_name, user_type, status",
      });

      if (!user) {
        return { success: false, error: "Utente non trovato." };
      }

      // Crea sessione Stripe Identity (richiede documento + selfie biometrico)
      const session = await stripe.identity.verificationSessions.create({
        type: "document",
        metadata: {
          waitlistId: user.id,
          userId: context.userId,
          userType: (user.user_type as string) || "professionista",
        },
        options: {
          document: {
            require_matching_selfie: true,
          },
        },
        return_url: `${input.returnUrl}?session_id={VERIFICATION_SESSION_ID}`,
      });

      // Salva session_id sul record
      await supabaseAdmin
        .from("waitlist")
        .update({ identity_session_id: session.id })
        .eq("id", user.id);

      return {
        success: true,
        url: session.url,
        sessionId: session.id,
      };
    } catch (err: any) {
      console.error("Errore creazione sessione Stripe Identity:", err);
      return { success: false, error: err?.message || "Errore durante la creazione della sessione Stripe Identity." };
    }
  });

/**
 * 2. Verifica immediata dello stato della sessione Stripe Identity
 */
export const checkStripeIdentitySession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        sessionId: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data: input, context }) => {
    try {
      const stripe = getStripeClient();
      if (!stripe) {
        return { success: false, error: "Stripe non configurato." };
      }

      const user = await getOwnedWaitlistRecord(context.userId, {
        columns: "id, full_name, status, identity_verified",
      });

      if (!user) {
        return { success: false, error: "Utente non trovato." };
      }

      const session = await stripe.identity.verificationSessions.retrieve(input.sessionId);

      // La sessione deve appartenere a chi sta chiamando. L'id arriva dal
      // client, perche' Stripe lo rimette nell'URL dopo il redirect: senza
      // questo confronto basterebbe riusare l'id di una sessione verificata di
      // un altro per farsi marcare come verificati.
      if (session.metadata?.waitlistId !== user.id) {
        console.warn("Sessione Stripe Identity non corrispondente al profilo:", session.id);
        return { success: false, error: "Sessione di verifica non riconosciuta." };
      }

      if (session.status === "verified") {
        const { error } = await registraIdentitaVerificata(
          user.id,
          "stripe_identity",
          session.id,
          (user.status as string) || null,
        );
        if (error) {
          console.error("Errore salvataggio esito verifica:", error);
          return { success: false, error: "Impossibile salvare l'esito della verifica." };
        }

        return {
          success: true,
          verified: true,
          status: "verified",
        };
      }

      return {
        success: true,
        verified: false,
        status: session.status,
      };
    } catch (err: any) {
      console.error("Errore verifica sessione Stripe:", err);
      return { success: false, error: err?.message || "Errore verifica sessione." };
    }
  });

// Qui esisteva completeSpidVerification, un endpoint che accettava un nome di
// provider come stringa libera e scriveva identity_verified = true senza
// verificare nulla: nessuna asserzione SAML, nessuna chiamata a un gestore
// SPID. Qualunque utente registrato poteva dichiararsi verificato e pubblicarsi.
// E' stato rimosso. SPID e CIE si possono aggiungere solo con un'integrazione
// vera presso un aggregatore accreditato AgID, che valida l'asserzione firmata
// del gestore: finche' non c'e', l'unico canale e' Stripe Identity.

/**
 * 3. Stato attuale dell'identità dell'utente autenticato
 */
export const getIdentityVerificationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const user = await getOwnedWaitlistRecord(context.userId, {
        columns: "id, full_name, status, identity_verified, verification_method, verified_at, user_type",
      });

      if (!user) {
        return { success: false, error: "Profilo non trovato." };
      }

      return {
        success: true,
        proId: user.id,
        fullName: (user.full_name as string) || "",
        status: (user.status as string) || "nuovo",
        // Il ripiego su status === "attivo" copre i profili approvati a mano
        // prima che queste colonne esistessero: per quelli la verifica del
        // documento l'ha fatta l'admin, quindi "verificato" e' corretto.
        // Attenzione: "verified" dice che l'identita' e' stata controllata, non
        // che il profilo sia visibile. La visibilita' e' solo status === "attivo".
        verified: Boolean(user.identity_verified) || user.status === "attivo",
        method: (user.verification_method as string) || null,
        verifiedAt: (user.verified_at as string) || null,
        userType: (user.user_type as string) || "professionista",
      };
    } catch (err: any) {
      console.error("Errore getIdentityVerificationStatus:", err);
      return { success: false, error: "Errore nel recupero dello stato di verifica." };
    }
  });
