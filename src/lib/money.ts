import type { Order, OrderItem, ReturnResolution } from '@/types';
import { STORE_CREDIT_BONUS } from './constants';

/**
 * Money helpers. Everything is kept in **integer cents** end-to-end — we never
 * introduce floating-point dollars into intermediate math, only at format time.
 * This is the "fiddly bit" the brief calls out, so it lives in one tested place.
 */

/** Format integer cents as a localized currency string, e.g. 14200 -> "$142.00". */
export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/** Line total for a single item: unit price × quantity (in cents). */
export function lineTotalCents(unitPriceCents: number, quantity: number): number {
  return unitPriceCents * quantity;
}

/** Sum of every line in an order (in cents). */
export function orderTotalCents(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + lineTotalCents(item.unitPriceCents, item.quantity),
    0,
  );
}

/**
 * Value of the items selected to return (in cents), given a map of
 * itemId -> quantity. Unknown ids and non-positive quantities are ignored.
 */
export function returnedValueCents(
  items: OrderItem[],
  selections: Record<string, number>,
): number {
  return items.reduce((sum, item) => {
    const qty = selections[item.id] ?? 0;
    if (qty <= 0) return sum;
    return sum + lineTotalCents(item.unitPriceCents, qty);
  }, 0);
}

/**
 * The amount the shopper receives for a chosen resolution (in cents).
 * Store credit adds the +10% bonus; refund and exchange are at value.
 * Rounded to whole cents so we never hand back fractional currency.
 */
export function resolutionAmountCents(
  valueCents: number,
  resolution: ReturnResolution,
): number {
  if (resolution === 'store_credit') {
    return Math.round(valueCents * (1 + STORE_CREDIT_BONUS));
  }
  return valueCents;
}

/** The bonus portion of a store-credit resolution (in cents); 0 otherwise. */
export function storeCreditBonusCents(
  valueCents: number,
  resolution: ReturnResolution,
): number {
  if (resolution !== 'store_credit') return 0;
  return resolutionAmountCents(valueCents, resolution) - valueCents;
}
