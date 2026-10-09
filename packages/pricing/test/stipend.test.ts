import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { FOUNDING_STIPEND as config, computeStipend, monthlyCapSen, type MonthFinancials } from "../src/index.js";

const good: MonthFinancials = { gmvSen: 300_000_000, networkRevenueSen: 10_000_000, operatingCostsSen: 4_000_000 };
const bad: MonthFinancials = { gmvSen: 50_000_000, networkRevenueSen: 1_000_000, operatingCostsSen: 3_000_000 };

const arbMonth = fc.record({
  gmvSen: fc.integer({ min: 0, max: 10_000_000_000 }),
  networkRevenueSen: fc.integer({ min: 0, max: 100_000_000 }),
  operatingCostsSen: fc.integer({ min: 0, max: 100_000_000 }),
});

describe("steward stipend", () => {
  it("cap is 3 × KL median household income (RM32,415/month)", () => {
    expect(monthlyCapSen(config)).toBe(3_241_500);
  });

  it("pays nothing without enough history", () => {
    const r = computeStipend({ month: good, history: [good], reserveBalanceSen: 99_999_999, reserveTargetSen: 0 }, config);
    expect(r.sustainable).toBe(false);
    expect(r.stipendSen).toBe(0);
  });

  it("pays nothing if any recent month ran at a loss", () => {
    const r = computeStipend({ month: good, history: [bad, good], reserveBalanceSen: 99_999_999, reserveTargetSen: 0 }, config);
    expect(r.stipendSen).toBe(0);
  });

  it("fills the reserve before paying any stipend", () => {
    const r = computeStipend({ month: good, history: [good, good], reserveBalanceSen: 0, reserveTargetSen: 20_000_000 }, config);
    expect(r.sustainable).toBe(false);
    expect(r.reserveTopUpSen).toBe(6_000_000);
    expect(r.stipendSen).toBe(0);
  });

  it("pays min(0.5% GMV, cap, surplus) once sustainable", () => {
    const r = computeStipend({ month: good, history: [good, good], reserveBalanceSen: 20_000_000, reserveTargetSen: 20_000_000 }, config);
    expect(r.sustainable).toBe(true);
    // 0.5% of RM3M = RM15,000; below the RM32,415 cap and the RM60,000 surplus
    expect(r.stipendSen).toBe(1_500_000);
    expect(r.patronagePoolSen).toBe(6_000_000 - 1_500_000);
  });

  it("never exceeds the cap or the surplus, and never creates money", () => {
    fc.assert(
      fc.property(
        arbMonth,
        fc.array(arbMonth, { maxLength: 6 }),
        fc.nat(200_000_000),
        fc.nat(200_000_000),
        (month, history, reserveBalanceSen, reserveTargetSen) => {
          const r = computeStipend({ month, history, reserveBalanceSen, reserveTargetSen }, config);
          const surplus = Math.max(0, month.networkRevenueSen - month.operatingCostsSen);
          expect(r.stipendSen).toBeLessThanOrEqual(monthlyCapSen(config));
          expect(r.stipendSen + r.reserveTopUpSen + r.patronagePoolSen).toBe(surplus);
          expect(r.patronagePoolSen).toBeGreaterThanOrEqual(0);
          if (!r.sustainable) expect(r.stipendSen).toBe(0);
        },
      ),
    );
  });
});
