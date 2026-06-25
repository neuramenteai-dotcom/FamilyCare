import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyIdentityDocument } from "@/server/ai-verification";

export const uploadIdentityDocument = createServerFn({ method: "POST" })
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    try {
      const waitlistId = formData.get("waitlistId") as string;
      const file = formData.get("file") as File | null;
      
      if (!waitlistId || !file) {
        return { success: false, error: "ID o File mancante." };
      }

      // 1. Leggi il record dal database per ottenere il nome
      const { data: record, error: fetchError } = await supabaseAdmin
        .from("waitlist")
        .select("id, full_name, status")
        .eq("id", waitlistId)
        .single();

      if (fetchError || !record) {
        return { success: false, error: "Utente non trovato." };
      }

      // 2. Carica il file su Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${waitlistId}_front_${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from("identity_docs")
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { success: false, error: "Errore durante il caricamento del documento." };
      }

      // 3. Ottieni l'URL pubblico (o interno)
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("identity_docs")
        .getPublicUrl(fileName);
        
      const fileUrl = publicUrlData.publicUrl;

      // 4. Esegui l'analisi AI
      const aiResult = await verifyIdentityDocument(
        arrayBuffer,
        file.type,
        record.full_name || ""
      );

      // 5. Determina il nuovo stato
      let newStatus = "in_verifica"; // Default: da controllare manualmente
      if (aiResult.isMatch) {
        newStatus = "pre_approvato"; // AI ha confermato il nome
      }

      // 6. Aggiorna il database
      const { error: updateError } = await supabaseAdmin
        .from("waitlist")
        .update({
          id_front_url: fileUrl,
          status: newStatus,
          score: Math.round(aiResult.confidence * 100) // Salva il rating AI nel campo score
        })
        .eq("id", waitlistId);

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
