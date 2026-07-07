import { describe, it, expect } from "vitest";
import { matchNames } from "./name-match";

describe("matchNames", () => {
  it("riconosce un nome identico", () => {
    const res = matchNames("Mario Rossi", "Mario Rossi");
    expect(res.isMatch).toBe(true);
    expect(res.confidence).toBe(1);
  });

  it("è case-insensitive e tollera spazi extra", () => {
    const res = matchNames("  MARIO   ROSSI ", "mario rossi");
    expect(res.isMatch).toBe(true);
    expect(res.confidence).toBe(1);
  });

  it("accetta un secondo nome sul documento non inserito nel form", () => {
    const res = matchNames("Mario Giuseppe Rossi", "Mario Rossi");
    expect(res.isMatch).toBe(true);
    expect(res.confidence).toBe(1);
  });

  it("accetta metà del nome (soglia 50%)", () => {
    const res = matchNames("Mario Bianchi", "Mario Rossi");
    expect(res.confidence).toBe(0.5);
    expect(res.isMatch).toBe(true);
  });

  it("rifiuta un nome completamente diverso", () => {
    const res = matchNames("Luigi Verdi", "Mario Rossi");
    expect(res.isMatch).toBe(false);
    expect(res.confidence).toBe(0);
  });

  it("rifiuta input vuoti", () => {
    expect(matchNames("", "Mario Rossi").isMatch).toBe(false);
    expect(matchNames("Mario Rossi", "").isMatch).toBe(false);
    expect(matchNames("", "").isMatch).toBe(false);
    expect(matchNames("   ", "Mario Rossi").isMatch).toBe(false);
  });

  it("sotto la soglia del 50% non matcha", () => {
    const res = matchNames("Mario Bianchi", "Mario Rossi Verdi");
    expect(res.confidence).toBeCloseTo(1 / 3);
    expect(res.isMatch).toBe(false);
  });
});
