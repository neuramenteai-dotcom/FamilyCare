import { afterEach, describe, expect, it } from "vitest";
import { canStartCheckout } from "./access-rollout";

describe("canStartCheckout", () => {
  afterEach(() => {
    delete process.env.TEST_CHECKOUT_EMAILS;
  });

  it("consente il checkout all'indirizzo incluso nella whitelist, senza dipendere da maiuscole o spazi", () => {
    process.env.TEST_CHECKOUT_EMAILS = "  prova.famiglia@example.test , altra@example.test ";

    expect(canStartCheckout("PROVA.FAMIGLIA@example.test")).toBe(true);
  });

  it("nega il checkout a un indirizzo che non fa parte della whitelist durante il pre-lancio", () => {
    process.env.TEST_CHECKOUT_EMAILS = "prova.famiglia@example.test";

    expect(canStartCheckout("visitatore@example.test")).toBe(false);
  });
});
