import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  BPS_DENOMINATOR,
  KLANG_VALLEY_PILOT as config,
  deliveryFee,
  quote,
  type PaymentMethod,
  type QuoteInput,
} from "../src/index.js";

const methods: PaymentMethod[] = ["duitnow_qr", "fpx", "card", "ewallet"];

const arbInput: fc.Arbitrary<QuoteInput> = fc.record({
  subtotalSen: fc.integer({ min: 0, max: 500_000 }),
  fulfilment: fc.constantFrom("network_rider" as const, "shop_delivery" as const, "pickup" as const),
  distanceMetres: fc.integer({ min: 0, max: 30_000 }),
  durationMinutes: fc.integer({ min: 0, max: 120 }),
  tipSen: fc.integer({ min: 0, max: 10_000 }),
  paymentMethod: fc.constantFrom(...methods),
});

describe("deliveryFee", () => {
  it("applies the minimum for short trips", () => {
    expect(deliveryFee(200, 2, config)).toBe(500);
  });

  it("charges base + per-km + per-minute, rounded up to 10 sen", () => {
    // 300 + 5.2km × 70 = 364 + 18min × 10 = 180 → 844 → 850
    expect(deliveryFee(5_200, 18, config)).toBe(850);
  });

  it("never decreases as distance or time grows", () => {
    fc.assert(
      fc.property(fc.nat(30_000), fc.nat(30_000), fc.nat(120), fc.nat(120), (d1, d2, t1, t2) => {
        const [dLo, dHi] = d1 <= d2 ? [d1, d2] : [d2, d1];
        const [tLo, tHi] = t1 <= t2 ? [t1, t2] : [t2, t1];
        expect(deliveryFee(dHi, tHi, config)).toBeGreaterThanOrEqual(deliveryFee(dLo, tLo, config));
      }),
    );
  });
});

describe("quote", () => {
  it("prices a typical RM30 rider delivery paid by DuitNow QR", () => {
    const q = quote(
      { subtotalSen: 3_000, fulfilment: "network_rider", distanceMetres: 4_000, durationMinutes: 15, tipSen: 200, paymentMethod: "duitnow_qr" },
      config,
    );
    // delivery: 300 + 280 + 150 = 730
    expect(q.customer.deliveryFeeSen).toBe(730);
    expect(q.payouts.shopSen).toBe(3_000);
    expect(q.payouts.rider).toEqual({ grossSen: 930, socsoSen: 9, netSen: 921 });
    expect(q.payouts.networkSen).toBe(99);
    expect(q.customer.totalSen).toBe(3_000 + 730 + 99 + 200 + q.customer.processingFeeSen);
  });

  it("charges no delivery fee for pickup", () => {
    const q = quote(
      { subtotalSen: 2_000, fulfilment: "pickup", distanceMetres: 9_999, durationMinutes: 99, tipSen: 0, paymentMethod: "fpx" },
      config,
    );
    expect(q.customer.deliveryFeeSen).toBe(0);
    expect(q.payouts.rider).toBeNull();
  });

  it("conserves money: everything the customer pays is paid out", () => {
    fc.assert(
      fc.property(arbInput, (input) => {
        const q = quote(input, config);
        const riderGross = q.payouts.rider?.grossSen ?? 0;
        expect(q.payouts.shopSen + riderGross + q.payouts.networkSen + q.payouts.processorSen).toBe(q.customer.totalSen);
      }),
    );
  });

  it("shop keeps 100% of menu prices (0% commission)", () => {
    fc.assert(
      fc.property(arbInput, (input) => {
        expect(quote(input, config).payouts.shopSen).toBeGreaterThanOrEqual(input.subtotalSen);
      }),
    );
  });

  it("rider keeps 100% of delivery fee and tip, minus only statutory SOCSO", () => {
    fc.assert(
      fc.property(arbInput, (input) => {
        const q = quote({ ...input, fulfilment: "network_rider" }, config);
        const rider = q.payouts.rider!;
        expect(rider.grossSen).toBe(q.customer.deliveryFeeSen + input.tipSen);
        expect(rider.socsoSen).toBeLessThanOrEqual(Math.ceil((q.customer.deliveryFeeSen * config.riderSocsoBps) / BPS_DENOMINATOR));
        expect(rider.netSen).toBe(rider.grossSen - rider.socsoSen);
      }),
    );
  });

  it("collects enough to cover the provider fee, with at most 1 sen of slack", () => {
    fc.assert(
      fc.property(arbInput, (input) => {
        const q = quote(input, config);
        const { rateBps, fixedSen } = config.processing[input.paymentMethod];
        const providerFee = Math.ceil((q.customer.totalSen * rateBps) / BPS_DENOMINATOR) + fixedSen;
        expect(q.customer.processingFeeSen).toBeGreaterThanOrEqual(providerFee);
        expect(q.customer.processingFeeSen - providerFee).toBeLessThanOrEqual(1);
      }),
    );
  });

  it("rejects fractional or negative money", () => {
    const base: QuoteInput = { subtotalSen: 1_000, fulfilment: "pickup", distanceMetres: 0, durationMinutes: 0, tipSen: 0, paymentMethod: "fpx" };
    expect(() => quote({ ...base, subtotalSen: 10.5 }, config)).toThrow(RangeError);
    expect(() => quote({ ...base, tipSen: -1 }, config)).toThrow(RangeError);
  });
});
