import { GoogleGenAI } from "@google/genai";
import { matchNames } from "./name-match";

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function verifyIdentityDocument(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  expectedName: string,
): Promise<{ isMatch: boolean; extractedName?: string; confidence: number }> {
  if (!ai) {
    console.warn("GEMINI_API_KEY non configurata. Salto la verifica AI automatica.");
    return { isMatch: false, confidence: 0 };
  }

  try {
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: `Questo è un documento d'identità.
Estrai il NOME e il COGNOME esatti della persona.
Rispondi SOLO con un JSON valido strutturato così:
{
  "nome_completo": "Nome Cognome estratto",
  "è_documento_valido": true/false
}
Se l'immagine non è un documento d'identità valido, imposta è_documento_valido a false.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const result = JSON.parse(responseText);

    if (!result.è_documento_valido || !result.nome_completo) {
      return { isMatch: false, confidence: 0 };
    }

    const { isMatch, confidence } = matchNames(result.nome_completo, expectedName);

    return {
      isMatch,
      extractedName: result.nome_completo,
      confidence,
    };
  } catch (err) {
    console.error("Errore durante la verifica AI del documento:", err);
    return { isMatch: false, confidence: 0 };
  }
}
