import { memo, useMemo } from 'react';
import { cn } from '@/lib';
import { RESOLUTION_OPTIONS, resolutionAmountCents, returnedValueCents, storeCreditBonusCents, formatMoney } from '@/lib';
import { STORE_CREDIT_BONUS } from '@/lib';
import type { Order, ReturnDraft, ReturnResolution } from '@/types';

type StepResolutionProps = {
  order: Order;
  draft: ReturnDraft;
  onResolutionChange: (resolution: ReturnResolution) => void;
};

/**
 * Step 3: Choose a resolution (refund / exchange / store credit).
 * Shows the amount for each option, with the store-credit bonus highlighted.
 */
export const StepResolution = memo(function StepResolution({
  order,
  draft,
  onResolutionChange,
}: StepResolutionProps) {
  const returnableItems = order.items.filter((item) => item.returnEligible);
  const returnedValue = useMemo(
    () => returnedValueCents(returnableItems, draft.selections),
    [returnableItems, draft.selections],
  );

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-ink">How would you like to resolve this?</legend>
      <div className="grid gap-3">
        {RESOLUTION_OPTIONS.map((option) => {
          const amount = resolutionAmountCents(returnedValue, option.value);
          const bonus = storeCreditBonusCents(returnedValue, option.value);

          return (
            <label key={option.value} className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="resolution"
                value={option.value}
                checked={draft.resolution === option.value}
                onChange={(e) => onResolutionChange(e.target.value as ReturnResolution)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-ink">{option.title}</p>
                <p className="text-sm text-muted">{option.description}</p>
                <p className="mt-1.5 text-sm font-semibold text-brand">
                  {formatMoney(amount)}
                  {bonus > 0 && (
                    <span className="ml-1.5 text-xs text-success">
                      (+{formatMoney(bonus)} bonus)
                    </span>
                  )}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
});
