/**
 * Filtro dei recapiti personali nei messaggi in chat.
 *
 * Serve a tenere la conversazione dentro la piattaforma: appena due persone si
 * scambiano il numero, il rapporto esce e non torna. Non puo' essere perfetto —
 * chi vuole aggirarlo ci riesce — ma intercetta lo scambio casuale, che e' la
 * stragrande maggioranza.
 *
 * Il vincolo difficile non e' riconoscere i numeri: e' NON bloccare i messaggi
 * legittimi. Una chat di assistenza familiare e' piena di numeri veri — "ho tre
 * bambini", "dalle otto alle sei", "nove euro all'ora", "disponibile dal
 * 18/10/2026" — e un filtro che li rifiuta rende il prodotto inutilizzabile.
 * Per questo le soglie sono alte e si contano solo cifre CONSECUTIVE: una
 * sequenza lunga di numeri attaccati non capita per caso, mentre i numeri
 * sparsi in una frase sono quasi sempre in buona fede.
 */

export type MotivoBlocco = "telefono" | "email" | "social";

export interface EsitoFiltro {
  pulito: boolean;
  motivo?: MotivoBlocco;
}

// Cifre scritte in lettere. Solo 0-9: includere "venti" o "trenta" farebbe
// scattare il filtro su "ho venti anni di esperienza".
const CIFRE_IN_LETTERE: Record<string, number> = {
  zero: 1,
  uno: 1,
  un: 1,
  due: 1,
  tre: 1,
  tré: 1,
  quattro: 1,
  cinque: 1,
  sei: 1,
  sette: 1,
  otto: 1,
  nove: 1,
};

// Una sequenza di sole cifre deve essere lunga almeno quanto un numero
// telefonico italiano. Sotto questa soglia restano fuori date (18/10/2026 fa
// otto cifre) e importi (1.500,00 ne fa sei).
const SOGLIA_SOLO_CIFRE = 9;

// Se nella sequenza compare anche una cifra scritta a parole, la soglia scende:
// scandire sei numeri di fila a parole non e' un modo naturale di parlare.
const SOGLIA_CON_PAROLE = 6;

const RE_EMAIL = /[\w.+-]{2,}@[\w-]{2,}\.[a-z]{2,}/i;

// Email offuscata: "mario chiocciola gmail punto com", "mario (at) gmail (dot) com"
const RE_EMAIL_OFFUSCATA =
  /[\w.+-]{2,}\s*(?:\(\s*at\s*\)|\[\s*at\s*\]|\bchiocciola\b|\bat\b)\s*[\w-]{2,}\s*(?:\(\s*dot\s*\)|\[\s*dot\s*\]|\bpunto\b|\bdot\b|\.)\s*(?:it|com|net|org|eu|io)\b/i;

const RE_SOCIAL =
  /\b(?:wa\.me|t\.me|m\.me|telegram\.me|api\.whatsapp\.com|instagram\.com|facebook\.com|tiktok\.com)\b/i;

const PIATTAFORME = "instagram|insta|ig|telegram|tg|whatsapp|whatsup|facebook|fb|tiktok|snapchat";

// "telegram: mario_rossi" — nome subito dopo i due punti
const RE_HANDLE_DOPO_DUEPUNTI = new RegExp(
  `\\b(?:${PIATTAFORME})\\b\\s*[:=]\\s*@?[a-z0-9._]{3,}`,
  "i",
);

// "il mio instagram è @mario" — fra la piattaforma e il nome puo' esserci una
// manciata di caratteri ("è", "e'", "sono"), quindi si guarda in un raggio corto.
const RE_HANDLE_CON_CHIOCCIOLA = new RegExp(
  `\\b(?:${PIATTAFORME})\\b[^\\n]{0,12}?@[a-z0-9._]{3,}`,
  "i",
);

// Una chiocciola isolata e' quasi sempre un nome utente: le email sono gia'
// state intercettate prima, quindi qui resta solo il social.
const RE_CHIOCCIOLA_ISOLATA = /(?:^|\s)@[a-z0-9._]{3,}/i;

/** Un token conta come numerico se e' tutto cifre o una cifra scritta a parole. */
function cifreDelToken(token: string): number {
  if (/^\d+$/.test(token)) return token.length;
  const parola = token.toLowerCase();
  return CIFRE_IN_LETTERE[parola] ?? 0;
}

/**
 * Cerca la sequenza piu' lunga di token numerici consecutivi e decide se supera
 * la soglia. I separatori (spazi, punti, trattini, barre, parentesi, +) non
 * interrompono la sequenza; qualunque altra parola la interrompe.
 */
function contieneTelefono(testo: string): boolean {
  const token = testo.split(/[\s.\-/\\()+·•_,]+/u).filter(Boolean);

  let cifre = 0;
  let conParole = false;

  for (const t of token) {
    const n = cifreDelToken(t);
    if (n > 0) {
      cifre += n;
      if (!/^\d+$/.test(t)) conParole = true;
      const soglia = conParole ? SOGLIA_CON_PAROLE : SOGLIA_SOLO_CIFRE;
      if (cifre >= soglia) return true;
    } else {
      cifre = 0;
      conParole = false;
    }
  }
  return false;
}

/**
 * Esamina un messaggio prima dell'invio.
 * Ritorna `pulito: false` con il motivo quando contiene un recapito personale.
 */
export function analizzaMessaggio(testo: string): EsitoFiltro {
  if (!testo) return { pulito: true };

  if (RE_EMAIL.test(testo) || RE_EMAIL_OFFUSCATA.test(testo)) {
    return { pulito: false, motivo: "email" };
  }
  if (
    RE_SOCIAL.test(testo) ||
    RE_HANDLE_DOPO_DUEPUNTI.test(testo) ||
    RE_HANDLE_CON_CHIOCCIOLA.test(testo) ||
    RE_CHIOCCIOLA_ISOLATA.test(testo)
  ) {
    return { pulito: false, motivo: "social" };
  }
  if (contieneTelefono(testo)) {
    return { pulito: false, motivo: "telefono" };
  }
  return { pulito: true };
}

/** Messaggio da mostrare a chi ha provato a inviare un recapito. */
export function spiegazione(motivo: MotivoBlocco): string {
  const cosa =
    motivo === "email"
      ? "un indirizzo email"
      : motivo === "social"
        ? "un contatto social"
        : "un numero di telefono";
  return `Il messaggio sembra contenere ${cosa}. Per la sicurezza di entrambi i recapiti personali non si scambiano in chat: potete parlarvi qui o in videochiamata, e scambiarveli quando avrete deciso di incontrarvi.`;
}
