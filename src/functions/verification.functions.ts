import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth, requireAdmin } from "@/integrations/supabase/auth-middleware";
import { getOwnedWaitlistRecord } from "@/server/authz";

const DOC_TYPES = ["casellario", "referenza", "attestato"] as const;
type DocType = (typeof DOC_TYPES)[number];

// Mappa tipo documento -> colonna badge su waitlist
const BADGE_COLUMN: Record<DocType, string> = {
  casellario: "criminal_check_verified",
  referenza: "references_verified",
  attestato: "certificates_verified",
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const BUCKET = "pro_documents";

// --- PROFESSIONISTA: carica un documento di verifica ---
export const uploadProfessionalDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData, context }) => {
    try {
      const docType = String(formData.get("docType") || "");
      const file = formData.get("file") as File | null;

      if (!DOC_TYPES.includes(docType as DocType)) {
        return { success: false, error: "Tipo di documento non valido." };
      }
      if (!file) return { success: false, error: "File mancante." };
      if (!ALLOWED_MIME.includes(file.type)) {
        return { success: false, error: "Formato non supportato (JPG, PNG, WEBP o PDF)." };
      }
      if (file.size > MAX_SIZE) {
        return { success: false, error: "Il file supera i 10 MB." };
      }

      const pro = await getOwnedWaitlistRecord(context.userId, { userType: "professionista" });
      if (!pro) return { success: false, error: "Profilo professionista non trovato." };

      const ext = file.name.split(".").pop();
      const path = `${pro.id}/${docType}_${Date.now()}.${ext}`;
      const buffer = await file.arrayBuffer();

      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: file.type, upsert: true });
      if (upErr) {
        console.error("pro document upload error:", upErr);
        return { success: false, error: "Errore durante il caricamento." };
      }

      const { error: insErr } = await supabaseAdmin.from("professional_documents").insert({
        professional_id: pro.id,
        doc_type: docType,
        storage_path: path,
        status: "pending",
      });
      if (insErr) throw insErr;

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

// --- PROFESSIONISTA: lista dei propri documenti + badge attuali ---
export const getMyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const pro = await getOwnedWaitlistRecord(context.userId, {
        userType: "professionista",
        columns: "id, criminal_check_verified, references_verified, certificates_verified",
      });
      if (!pro) return { success: false, error: "Profilo non trovato." };

      const { data: docs } = await supabaseAdmin
        .from("professional_documents")
        .select("id, doc_type, status, created_at")
        .eq("professional_id", pro.id)
        .order("created_at", { ascending: false });

      return {
        success: true,
        documents: docs || [],
        badges: {
          casellario: !!pro.criminal_check_verified,
          referenza: !!pro.references_verified,
          attestato: !!pro.certificates_verified,
        },
      };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

// --- ADMIN: documenti di un professionista con signed URL + badge ---
export const getProfessionalDocuments = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) => z.object({ professionalId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { data: docs } = await supabaseAdmin
        .from("professional_documents")
        .select("id, doc_type, storage_path, status, created_at")
        .eq("professional_id", data.professionalId)
        .order("created_at", { ascending: false });

      const withUrls = await Promise.all(
        (docs || []).map(async (d) => {
          const { data: signed } = await supabaseAdmin.storage
            .from(BUCKET)
            .createSignedUrl(d.storage_path, 60 * 10);
          return {
            id: d.id,
            doc_type: d.doc_type,
            status: d.status,
            created_at: d.created_at,
            url: signed?.signedUrl || null,
          };
        }),
      );

      const { data: pro } = await supabaseAdmin
        .from("waitlist")
        .select("criminal_check_verified, references_verified, certificates_verified")
        .eq("id", data.professionalId)
        .maybeSingle();

      return {
        success: true,
        documents: withUrls,
        badges: {
          casellario: pro?.criminal_check_verified ?? false,
          referenza: pro?.references_verified ?? false,
          attestato: pro?.certificates_verified ?? false,
        },
      };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

// --- ADMIN: approva/rifiuta un documento (approvazione imposta il badge) ---
export const reviewProfessionalDocument = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z
      .object({
        documentId: z.string().uuid(),
        status: z.enum(["approved", "rejected"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      const { data: doc } = await supabaseAdmin
        .from("professional_documents")
        .select("id, professional_id, doc_type")
        .eq("id", data.documentId)
        .maybeSingle();
      if (!doc) return { success: false, error: "Documento non trovato." };

      const { error } = await supabaseAdmin
        .from("professional_documents")
        .update({
          status: data.status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: context.userId,
        })
        .eq("id", data.documentId);
      if (error) throw error;

      // Approvazione => imposta il badge corrispondente
      if (data.status === "approved") {
        const badge = BADGE_COLUMN[doc.doc_type as DocType];
        if (badge) {
          // chiave colonna dinamica: cast necessario per il client tipizzato
          await supabaseAdmin
            .from("waitlist")
            .update({ [badge]: true } as never)
            .eq("id", doc.professional_id);
        }
      }

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });

// --- ADMIN: imposta manualmente un badge di verifica ---
export const setVerificationBadge = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z
      .object({
        professionalId: z.string().uuid(),
        badge: z.enum(["criminal_check_verified", "references_verified", "certificates_verified"]),
        value: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { error } = await supabaseAdmin
        .from("waitlist")
        .update({ [data.badge]: data.value } as never)
        .eq("id", data.professionalId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Errore del server." };
    }
  });
