/**
 * Order domain types.
 *
 * The mock backend is the source of truth for the wire shapes, so we re-export
 * its types here rather than redeclaring them. This gives the rest of the app a
 * single, service-agnostic import surface (`@/types`) and keeps us honest if the
 * contract ever changes.
 */
export type {
  Order,
  OrderItem,
  OrderStatus,
  Page,
} from '../services/mockApi';

/** The status filter shown in the dashboard — every status plus an "all" option. */
export type StatusFilter = import('../services/mockApi').OrderStatus | 'all';
