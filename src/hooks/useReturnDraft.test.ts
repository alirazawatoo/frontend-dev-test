import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useReturnDraft } from './useReturnDraft';

describe('useReturnDraft', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useReturnDraft());
    expect(result.current.draft).toEqual({ selections: {}, reason: '', comment: '', resolution: null });
    expect(result.current.selectedCount).toBe(0);
  });

  it('tracks quantities and drops items set back to zero', () => {
    const { result } = renderHook(() => useReturnDraft());
    act(() => result.current.setQuantity('i_1', 2));
    act(() => result.current.setQuantity('i_2', 1));
    expect(result.current.draft.selections).toEqual({ i_1: 2, i_2: 1 });
    expect(result.current.selectedCount).toBe(3);

    act(() => result.current.setQuantity('i_1', 0));
    expect(result.current.draft.selections).toEqual({ i_2: 1 });
    expect(result.current.selectedCount).toBe(1);
  });

  it('stores reason, comment and resolution, and resets', () => {
    const { result } = renderHook(() => useReturnDraft());
    act(() => {
      result.current.setReason("Doesn't fit");
      result.current.setComment('Too small');
      result.current.setResolution('store_credit');
    });
    expect(result.current.draft).toMatchObject({
      reason: "Doesn't fit",
      comment: 'Too small',
      resolution: 'store_credit',
    });

    act(() => result.current.reset());
    expect(result.current.draft.reason).toBe('');
    expect(result.current.draft.resolution).toBeNull();
  });

  it('keeps callback identities stable across renders', () => {
    const { result, rerender } = renderHook(() => useReturnDraft());
    const { setQuantity, setReason } = result.current;
    act(() => setQuantity('i_1', 1));
    rerender();
    expect(result.current.setQuantity).toBe(setQuantity);
    expect(result.current.setReason).toBe(setReason);
  });
});
