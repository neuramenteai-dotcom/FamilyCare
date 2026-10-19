/**
 * Confronta il nome estratto dal documento con quello dichiarato dall'utente.
 *
 * La confidenza e' la frazione di parole del nome dichiarato presenti sul
 * documento. Si richiede corrispondenza piena: con una soglia al 50% bastava
 * un nome di battesimo in comune - "Mario Rossi" che carica il documento di
 * "Mario Bianchi" passava.
 *
 * Nomi in piu' sul documento non penalizzano: chi dichiara "Maria Bianchi" e
 * ha scritto "Maria Rosa Bianchi" sulla carta d'identita' corrisponde comunque.
 *
 * Nessuna delle due esiti pubblica il profilo: l'approvazione e' sempre umana.
 * La differenza e' solo quanto in fretta l'admin puo' decidere.
 */
export function matchNames(
  extractedName: string,
  expectedName: string,
): { isMatch: boolean; confidence: number } {
  const extractedWords = extractedName.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const expectedWords = expectedName.toLowerCase().trim().split(/\s+/).filter(Boolean);

  if (expectedWords.length === 0 || extractedWords.length === 0) {
    return { isMatch: false, confidence: 0 };
  }

  let matchCount = 0;
  for (const word of expectedWords) {
    if (extractedWords.includes(word)) {
      matchCount++;
    }
  }

  const confidence = matchCount / expectedWords.length;
  return { isMatch: confidence >= 1, confidence };
}
