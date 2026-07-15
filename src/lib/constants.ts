import type { OrderStatus, ReturnResolution, StatusFilter } from '../types';

/** Orders per page in the dashboard. Matches the mock API's default page size. */
export const PAGE_SIZE = 4;

/** Debounce delay (ms) for the dashboard search box. */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Store credit rewards a +10% bonus on the returned value (per the brief).
 * Expressed as a multiplier so money math stays in one place (see lib/money.ts).
 */
export const STORE_CREDIT_BONUS = 0.1;

/** Human-friendly label + Tailwind classes for each order status badge. */
export const STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  processing: {
    label: 'Processing',
    className: 'bg-warning-soft text-warning',
  },
  shipped: {
    label: 'In transit',
    className: 'bg-info-soft text-info',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-success-soft text-success',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-danger-soft text-danger',
  },
};

/** Options for the status filter dropdown, in display order. */
export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All orders' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** Resolution options offered in the return flow, with copy for each. */
export const RESOLUTION_OPTIONS: {
  value: ReturnResolution;
  title: string;
  description: string;
}[] = [
  {
    value: 'refund',
    title: 'Refund',
    description: 'Back to your original payment method.',
  },
  {
    value: 'exchange',
    title: 'Exchange',
    description: 'Swap for the same item in a different option.',
  },
  {
    value: 'store_credit',
    title: 'Store credit',
    description: 'Get 10% extra to spend on your next order.',
  },
];

/** Preset reasons for returning an item. */
export const RETURN_REASONS = [
  'Arrived damaged or defective',
  'Wrong item sent',
  "Doesn't fit",
  'Not as described',
  'No longer needed',
  'Other',
] as const;
