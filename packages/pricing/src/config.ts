import type { Bps, Sen } from "./money.js";

export type PaymentMethod = "duitnow_qr" | "fpx" | "card" | "ewallet";

export interface ProcessingRate {
  /** Percentage fee charged by the payment provider. */
  rateBps: Bps;
  /** Fixed fee per transaction. */
  fixedSen: Sen;
}

export interface DeliveryFeeConfig {
  baseSen: Sen;
  perKmSen: Sen;
  perMinuteSen: Sen;
  minimumSen: Sen;
  /** Fees are rounded up to this step so prices look tidy (10 sen). */
  roundingStepSen: Sen;
}

export interface PricingConfig {
  currency: "MYR";
  /** Flat fee per order that funds the network (infra, support, insurance, steward). */
  networkFeeSen: Sen;
  delivery: DeliveryFeeConfig;
  processing: Record<PaymentMethod, ProcessingRate>;
  /**
   * Statutory SOCSO (PERKESO) deduction on rider earnings under the
   * Gig Workers Act 2025 / Act 789. It goes into the rider's own SOCSO
   * account. Applied to delivery earnings, not tips.
   */
  riderSocsoBps: Bps;
}

/**
 * Pilot defaults for Klang Valley. These are starting points for the
 * co-op's first member vote, not final numbers. Payment rates are
 * placeholders until a payment provider contract is signed (see ADR 0003).
 *
 * Changing any value here changes what real people pay or earn:
 * requires human review (CODEOWNERS) and, after launch, a member vote.
 */
export const KLANG_VALLEY_PILOT: PricingConfig = {
  currency: "MYR",
  networkFeeSen: 99,
  delivery: {
    baseSen: 300,
    perKmSen: 70,
    perMinuteSen: 10,
    minimumSen: 500,
    roundingStepSen: 10,
  },
  processing: {
    duitnow_qr: { rateBps: 50, fixedSen: 0 },
    fpx: { rateBps: 0, fixedSen: 100 },
    card: { rateBps: 250, fixedSen: 50 },
    ewallet: { rateBps: 150, fixedSen: 0 },
  },
  riderSocsoBps: 125,
};
