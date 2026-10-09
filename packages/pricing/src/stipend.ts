import { applyBps, assertSen, type Bps, type Sen } from "./money.js";

/**
 * Steward (founder) stipend rules, as agreed for the founding bylaws:
 *
 * 1. Paid ONLY once the network is sustainable. Nothing accrues before that:
 *    months that don't qualify are never paid back later.
 * 2. Sustainable = the last `sustainableMonthsRequired` months each had network
 *    revenue >= operating costs, AND the reserve is at or above its target.
 * 3. The monthly stipend is the smallest of:
 *      - `rateBps` of the month's GMV
 *      - the cap: `capMultiple` × median monthly income
 *      - the month's surplus (revenue − costs − any reserve top-up)
 * 4. Anything left after the stipend goes to the patronage pool
 *    (fee cuts / dividends for riders, shops, customers).
 */
export interface StipendConfig {
  rateBps: Bps;
  medianMonthlyIncomeSen: Sen;
  capMultiple: number;
  sustainableMonthsRequired: number;
}

export interface MonthFinancials {
  gmvSen: Sen;
  networkRevenueSen: Sen;
  operatingCostsSen: Sen;
}

export interface StipendInput {
  /** The month being settled. */
  month: MonthFinancials;
  /** Previous months, oldest first. Does not include `month`. */
  history: readonly MonthFinancials[];
  reserveBalanceSen: Sen;
  reserveTargetSen: Sen;
}

export interface StipendResult {
  sustainable: boolean;
  reason: string;
  stipendSen: Sen;
  reserveTopUpSen: Sen;
  patronagePoolSen: Sen;
}

/**
 * Klang Valley basis: DOSM Household Income Survey 2024 median monthly gross
 * household income for W.P. Kuala Lumpur, RM10,805. Update when DOSM publishes
 * a newer survey. Changes need human review and a member vote.
 */
export const FOUNDING_STIPEND: StipendConfig = {
  rateBps: 50,
  medianMonthlyIncomeSen: 1_080_500,
  capMultiple: 3,
  sustainableMonthsRequired: 3,
};

export function monthlyCapSen(config: StipendConfig): Sen {
  return Math.floor(config.medianMonthlyIncomeSen * config.capMultiple);
}

function covered(m: MonthFinancials): boolean {
  return m.networkRevenueSen >= m.operatingCostsSen;
}

export function computeStipend(input: StipendInput, config: StipendConfig): StipendResult {
  const { month } = input;
  for (const [k, v] of Object.entries(month)) assertSen(v, k);
  assertSen(input.reserveBalanceSen, "reserveBalanceSen");
  assertSen(input.reserveTargetSen, "reserveTargetSen");

  const operatingSurplus = Math.max(0, month.networkRevenueSen - month.operatingCostsSen);
  const reserveTopUp = Math.min(operatingSurplus, Math.max(0, input.reserveTargetSen - input.reserveBalanceSen));
  const afterReserve = operatingSurplus - reserveTopUp;
  const reserveAfter = input.reserveBalanceSen + reserveTopUp;

  const window = [...input.history, month].slice(-config.sustainableMonthsRequired);
  const notSustainable = (reason: string): StipendResult => ({
    sustainable: false,
    reason,
    stipendSen: 0,
    reserveTopUpSen: reserveTopUp,
    patronagePoolSen: afterReserve,
  });

  if (window.length < config.sustainableMonthsRequired) {
    return notSustainable(`needs ${config.sustainableMonthsRequired} months of history`);
  }
  if (!window.every(covered)) {
    return notSustainable("revenue did not cover operating costs in every recent month");
  }
  if (reserveAfter < input.reserveTargetSen) {
    return notSustainable("reserve is below target");
  }

  const stipend = Math.min(applyBps(month.gmvSen, config.rateBps), monthlyCapSen(config), afterReserve);
  return {
    sustainable: true,
    reason: "sustainable",
    stipendSen: stipend,
    reserveTopUpSen: reserveTopUp,
    patronagePoolSen: afterReserve - stipend,
  };
}
