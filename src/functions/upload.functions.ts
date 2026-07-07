import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyIdentityDocument } from "@/server/ai-verification";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadIdentityDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData, context }) => {
    try {
      const file = formData.get("file") as File | null;

      if (!file) {
        return { success: false, error: "File mancante." };
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { success: false, error: "Formato non supportato. Usa JPG, PNG, WEBP o PDF." };
      }

      if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: "Il file supera la dimensione massima di 10 MB." };
      }

      // 1. Il record è quello dell'utente autenticato, mai un ID scelto dal client
      const { data: record, error: fetchError } = await supabaseAdmin
        .from("waitlist")
        .select("id, full_name, status")
        .eq("auth_id", context.userId)
        .single();

      if (fetchError || !record) {
        return { success: false, error: "Utente non trovato." };
      }

      // 2. Carica il file su Supabase Storage (bucket privato)
      const fileExt = file.name.split(".").pop();
      const filePath = `${record.id}_front_${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from("identity_docs")
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { success: false, error: "Errore durante il caricamento del documento." };
      }

      // 3. Esegui l'analisi AI
      const aiResult = await verifyIdentityDocument(
        arrayBuffer,
        file.type,
        record.full_name || ""
      );

      // 4. Determina il nuovo stato
      let newStatus = "in_verifica"; // Default: da controllare manualmente
      if (aiResult.isMatch) {
        newStatus = "pre_approvato"; // AI ha confermato il nome
      }

      // 5. Aggiorna il database. Il bucket è privato: salviamo il path,
      // l'admin lo visualizza tramite signed URL (getIdentityDocUrl).
      const { error: updateError } = await supabaseAdmin
        .from("waitlist")
        .update({
          id_front_url: filePath,
          status: newStatus,
          score: Math.round(aiResult.confidence * 100) // Salva il rating AI nel campo score
        })
        .eq("id", record.id);

      if (updateError) {
        console.error("DB update error:", updateError);
        return { success: false, error: "Errore durante l'aggiornamento dello stato." };
      }

      return {
        success: true,
        isMatch: aiResult.isMatch,
        status: newStatus,
        extractedName: aiResult.extractedName
      };

    } catch (err) {
      console.error("Upload error:", err);
      return { success: false, error: "Errore imprevisto del server." };
    }
  });
