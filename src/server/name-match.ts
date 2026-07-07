/**
 * Confronta il nome estratto dal documento con quello dichiarato dall'utente.
 * La confidenza è la frazione di parole del nome atteso presenti nel nome
 * estratto; la soglia al 50% tollera secondi nomi non inseriti nel form.
 */
export function matchNames(
  extractedName: string,
  expectedName: string
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
  return { isMatch: confidence >= 0.5, confidence };
}
