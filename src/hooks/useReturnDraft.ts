import { useCallback, useMemo, useReducer } from 'react';
import type { ReturnDraft, ReturnResolution } from '../types';

const initialDraft: ReturnDraft = {
  selections: {},
  reason: '',
  comment: '',
  resolution: null,
};

type DraftAction =
  | { type: 'setQuantity'; itemId: string; quantity: number }
  | { type: 'setReason'; reason: string }
  | { type: 'setComment'; comment: string }
  | { type: 'setResolution'; resolution: ReturnResolution | null }
  | { type: 'reset' };

function draftReducer(state: ReturnDraft, action: DraftAction): ReturnDraft {
  switch (action.type) {
    case 'setQuantity': {
      const next = { ...state.selections };
      if (action.quantity <= 0) {
        // Zero means "not returning this item" — drop it from the map entirely.
        delete next[action.itemId];
      } else {
        next[action.itemId] = action.quantity;
      }
      return { ...state, selections: next };
    }
    case 'setReason':
      return { ...state, reason: action.reason };
    case 'setComment':
      return { ...state, comment: action.comment };
    case 'setResolution':
      return { ...state, resolution: action.resolution };
    case 'reset':
      return initialDraft;
    default:
      return state;
  }
}

/**
 * Owns the client-side draft for the return flow. Exposes stable callbacks
 * (safe to pass to memoized children) plus a couple of derived conveniences.
 */
export function useReturnDraft() {
  const [draft, dispatch] = useReducer(draftReducer, initialDraft);

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'setQuantity', itemId, quantity });
  }, []);

  const setReason = useCallback((reason: string) => {
    dispatch({ type: 'setReason', reason });
  }, []);

  const setComment = useCallback((comment: string) => {
    dispatch({ type: 'setComment', comment });
  }, []);

  const setResolution = useCallback((resolution: ReturnResolution | null) => {
    dispatch({ type: 'setResolution', resolution });
  }, []);

  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const selectedCount = useMemo(
    () =>
      Object.values(draft.selections).reduce((sum, qty) => sum + qty, 0),
    [draft.selections],
  );

  return {
    draft,
    setQuantity,
    setReason,
    setComment,
    setResolution,
    reset,
    selectedCount,
  };
}
