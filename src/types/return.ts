/**
 * Return / exchange domain types.
 *
 * `ReturnRequest`, `ReturnReceipt`, and `ReturnResolution` are wire shapes owned
 * by the backend contract, so they're re-exported. `ReturnDraft` and friends are
 * client-only state that models the multi-step flow before it's submitted.
 */
export type {
  ReturnRequest,
  ReturnReceipt,
  ReturnResolution,
} from '../services/mockApi';

import type { ReturnResolution } from '../services/mockApi';

/** A single selected line in the return draft: how many of an item to send back. */
export type ReturnSelection = {
  itemId: string;
  quantity: number;
};

/** The ordered steps of the guided return flow. */
export type ReturnStep = 'items' | 'reason' | 'resolution' | 'review';

/**
 * Client-side draft state for the return flow. It accumulates the shopper's
 * choices step by step; on submit it's mapped to a `ReturnRequest`.
 */
export type ReturnDraft = {
  /** Map of itemId -> quantity selected (only eligible items ever appear here). */
  selections: Record<string, number>;
  reason: string;
  comment: string;
  resolution: ReturnResolution | null;
};
