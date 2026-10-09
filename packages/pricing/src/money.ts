/**
 * All money is integer sen (1 MYR = 100 sen). Never use floats for money.
 * Rates are basis points (1 bps = 0.01%, 10_000 bps = 100%).
 */
export type Sen = number;
export type Bps = number;

export const BPS_DENOMINATOR = 10_000;

export function assertSen(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer number of sen, got ${value}`);
  }
}

export function assertBps(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > BPS_DENOMINATOR) {
    throw new RangeError(`${name} must be an integer between 0 and ${BPS_DENOMINATOR} bps, got ${value}`);
  }
}

/** amount × rate, rounded half-up to the nearest sen. */
export function applyBps(amount: Sen, rate: Bps): Sen {
  return Math.floor((amount * rate + BPS_DENOMINATOR / 2) / BPS_DENOMINATOR);
}

/** Round up to the next multiple of `step` sen (e.g. 10 → nearest 10 sen). */
export function roundUpTo(amount: Sen, step: Sen): Sen {
  return Math.ceil(amount / step) * step;
}

export function formatMYR(amount: Sen): string {
  const ringgit = Math.floor(amount / 100);
  const sen = String(amount % 100).padStart(2, "0");
  return `RM${ringgit.toLocaleString("en-MY")}.${sen}`;
}
