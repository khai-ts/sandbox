import type { PaymentMethod, PricingConfig } from "./config.js";
import { applyBps, assertSen, BPS_DENOMINATOR, roundUpTo, type Sen } from "./money.js";

/**
 * - network_rider: a co-op rider delivers. Delivery fee goes to the rider.
 * - shop_delivery: the shop's own staff deliver. Delivery fee goes to the shop.
 * - pickup: customer collects. No delivery fee.
 */
export type Fulfilment = "network_rider" | "shop_delivery" | "pickup";

export interface QuoteInput {
  /** Sum of menu prices exactly as the shop set them. */
  subtotalSen: Sen;
  fulfilment: Fulfilment;
  /** Estimated route distance in metres (ignored for pickup). */
  distanceMetres: number;
  /** Estimated route duration in minutes (ignored for pickup). */
  durationMinutes: number;
  tipSen: Sen;
  paymentMethod: PaymentMethod;
}

export interface Quote {
  customer: {
    subtotalSen: Sen;
    deliveryFeeSen: Sen;
    networkFeeSen: Sen;
    tipSen: Sen;
    /** Payment provider cost, passed through at cost. */
    processingFeeSen: Sen;
    totalSen: Sen;
  };
  payouts: {
    shopSen: Sen;
    rider: { grossSen: Sen; socsoSen: Sen; netSen: Sen } | null;
    networkSen: Sen;
    processorSen: Sen;
  };
}

export function deliveryFee(distanceMetres: number, durationMinutes: number, config: PricingConfig): Sen {
  if (!(distanceMetres >= 0) || !(durationMinutes >= 0)) {
    throw new RangeError("distance and duration must be non-negative");
  }
  const d = config.delivery;
  const raw =
    d.baseSen +
    Math.ceil((distanceMetres * d.perKmSen) / 1000) +
    Math.ceil(durationMinutes * d.perMinuteSen);
  return roundUpTo(Math.max(raw, d.minimumSen), d.roundingStepSen);
}

/**
 * Price an order. Core promises enforced here, and by tests:
 * - The shop receives 100% of its menu prices (0% commission).
 * - The rider receives 100% of the delivery fee and tip, minus only the statutory SOCSO deduction.
 * - The customer pays the payment provider's cost at cost (grossed up), not a markup.
 * - Every sen the customer pays is accounted for in payouts.
 */
export function quote(input: QuoteInput, config: PricingConfig): Quote {
  assertSen(input.subtotalSen, "subtotalSen");
  assertSen(input.tipSen, "tipSen");

  const delivery =
    input.fulfilment === "pickup" ? 0 : deliveryFee(input.distanceMetres, input.durationMinutes, config);
  const network = config.networkFeeSen;
  const beforeProcessing = input.subtotalSen + delivery + network + input.tipSen;

  // Gross up so that after the provider takes rate% + fixed, everyone still gets their full share:
  // total - (total × rate + fixed) >= beforeProcessing
  const { rateBps, fixedSen } = config.processing[input.paymentMethod];
  const total = Math.ceil(((beforeProcessing + fixedSen) * BPS_DENOMINATOR) / (BPS_DENOMINATOR - rateBps));
  const processing = total - beforeProcessing;

  let shop = input.subtotalSen;
  let rider: Quote["payouts"]["rider"] = null;
  if (input.fulfilment === "network_rider") {
    const socso = applyBps(delivery, config.riderSocsoBps);
    const gross = delivery + input.tipSen;
    rider = { grossSen: gross, socsoSen: socso, netSen: gross - socso };
  } else {
    // Shop's own delivery staff, or pickup: delivery fee (if any) and tip go to the shop.
    shop += delivery + input.tipSen;
  }

  return {
    customer: {
      subtotalSen: input.subtotalSen,
      deliveryFeeSen: delivery,
      networkFeeSen: network,
      tipSen: input.tipSen,
      processingFeeSen: processing,
      totalSen: total,
    },
    payouts: {
      shopSen: shop,
      rider,
      networkSen: network,
      processorSen: processing,
    },
  };
}
