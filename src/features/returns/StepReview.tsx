import { memo, useMemo } from 'react';
import { ItemThumb } from '@/components';
import { formatMoney, lineTotalCents, resolutionAmountCents, returnedValueCents } from '@/lib';
import { RESOLUTION_OPTIONS } from '@/lib';
import type { Order, ReturnDraft } from '@/types';

type StepReviewProps = {
  order: Order;
  draft: ReturnDraft;
};

/**
 * Step 4: Review the full return request before submitting.
 * Shows selected items, reason, and the final resolution amount.
 */
export const StepReview = memo(function StepReview({ order, draft }: StepReviewProps) {
  const returnableItems = order.items.filter((item) => item.returnEligible);
  const selectedItems = returnableItems.filter((item) => (draft.selections[item.id] ?? 0) > 0);
  const returnedValue = useMemo(
    () => returnedValueCents(returnableItems, draft.selections),
    [returnableItems, draft.selections],
  );
  const resolutionAmount = resolutionAmountCents(returnedValue, draft.resolution!);

  const resolutionLabel =
    RESOLUTION_OPTIONS.find((r) => r.value === draft.resolution)?.title ?? '—';

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink">Items being returned</h2>
        <ul className="mt-3 space-y-2">
          {selectedItems.map((item) => {
            const qty = draft.selections[item.id]!;
            const lineTotal = lineTotalCents(item.unitPriceCents, qty);
            return (
              <li key={item.id} className="flex items-center gap-2">
                <ItemThumb name={item.name} color={item.thumbColor} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-muted">×{qty}</p>
                </div>
                <span className="text-sm font-medium text-ink">{formatMoney(lineTotal)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Reason</h2>
          <p className="mt-2 text-sm text-muted">{draft.reason}</p>
          {draft.comment && (
            <>
              <h3 className="mt-3 text-xs font-semibold text-muted">Comment</h3>
              <p className="mt-1 text-sm text-ink">{draft.comment}</p>
            </>
          )}
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Resolution</h2>
          <p className="mt-2 text-sm text-muted">{resolutionLabel}</p>
          <p className="mt-3 text-lg font-semibold text-brand">{formatMoney(resolutionAmount)}</p>
        </div>
      </div>
    </div>
  );
});
