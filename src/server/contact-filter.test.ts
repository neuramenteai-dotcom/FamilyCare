import { describe, it, expect } from "vitest";
import { analizzaMessaggio } from "./contact-filter";

const bloccato = (t: string) => analizzaMessaggio(t).pulito === false;
const passa = (t: string) => analizzaMessaggio(t).pulito === true;

describe("filtro recapiti: deve LASCIAR PASSARE i messaggi legittimi", () => {
  // Questi contano piu' dei blocchi: una chat di assistenza familiare e' piena
  // di numeri veri, e bloccarli rende il prodotto inutilizzabile.
  const legittimi = [
    "Ciao, quando possiamo fare la videochiamata?",
    "Ho tre bambini, di due e cinque anni",
    "Sono disponibile dalle otto alle sei, due volte a settimana",
    "Il mio compenso è 9 euro all'ora, va bene?",
    "Posso iniziare dal 18/10/2026",
    "Ho 10 anni di esperienza con persone non autosufficienti",
    "Abito a Roma, zona Prati, posso spostarmi",
    "Sei una persona molto gentile, grazie",
    "Il budget è di 1500 euro al mese",
    "Lavoro part time, circa 25 ore a settimana",
    "Ho lavorato con due famiglie negli ultimi tre anni",
    "Mia madre ha 87 anni ed è allettata",
    "Posso venire il 3 o il 4, dopo le 15",
  ];
  for (const t of legittimi) {
    it(`passa: "${t}"`, () => expect(passa(t)).toBe(true));
  }
});

describe("filtro recapiti: numeri di telefono in cifre", () => {
  const casi = [
    "chiamami al 3331234567",
    "il mio numero è 333 123 4567",
    "+39 333 1234567",
    "333-123-4567",
    "333.123.4567",
    "3 3 3 1 2 3 4 5 6 7",
    "scrivimi su whatsapp 3331234567",
  ];
  for (const t of casi) {
    it(`blocca: "${t}"`, () => expect(bloccato(t)).toBe(true));
  }

  it("riconosce il motivo", () => {
    expect(analizzaMessaggio("chiamami al 3331234567").motivo).toBe("telefono");
  });
});

describe("filtro recapiti: numeri scritti in lettere", () => {
  const casi = [
    "tre tre tre uno due tre quattro cinque sei sette",
    "il mio numero è tre tre tre uno due tre",
    "333 uno due tre quattro cinque sei",
    "zero sei quattro quattro cinque sei sette otto",
  ];
  for (const t of casi) {
    it(`blocca: "${t}"`, () => expect(bloccato(t)).toBe(true));
  }
});

describe("filtro recapiti: email", () => {
  const casi = [
    "scrivimi a mario.rossi@gmail.com",
    "la mia mail è mario chiocciola gmail punto com",
    "mario (at) gmail (dot) com",
    "contattami: anna.verdi+lavoro@libero.it",
  ];
  for (const t of casi) {
    it(`blocca: "${t}"`, () => expect(bloccato(t)).toBe(true));
  }

  it("riconosce il motivo", () => {
    expect(analizzaMessaggio("mario.rossi@gmail.com").motivo).toBe("email");
  });
});

describe("filtro recapiti: social e messaggistica", () => {
  const casi = [
    "scrivimi su wa.me/393331234567",
    "il mio instagram è @mariorossi",
    "telegram: mario_rossi",
    "cercami su facebook.com/mariorossi",
  ];
  for (const t of casi) {
    it(`blocca: "${t}"`, () => expect(bloccato(t)).toBe(true));
  }
});

describe("filtro recapiti: casi limite", () => {
  it("il messaggio vuoto passa", () => expect(passa("")).toBe(true));

  it("una data da sola non basta", () => expect(passa("ci vediamo il 18/10/2026")).toBe(true));

  it("un importo da solo non basta", () => expect(passa("costa 1.500,00 euro")).toBe(true));

  it("due cifre a parole di fila non bastano", () =>
    expect(passa("vengo due tre volte a settimana")).toBe(true));

  it("ma dieci cifre attaccate sì", () => expect(bloccato("il numero: 3331234567")).toBe(true));
});
