import { memo, useCallback } from 'react';
import { ItemThumb } from '@/components';
import { formatMoney } from '@/lib';
import type { Order, ReturnDraft } from '@/types';

type StepSelectItemsProps = {
  order: Order;
  draft: ReturnDraft;
  onQuantityChange: (itemId: string, quantity: number) => void;
};

const QUANTITY_LIMITS = [0, 1, 2, 3, 4, 5];

/**
 * Step 1: Select returnable items and quantities.
 * Only shows items marked returnEligible; caps qty at ordered qty.
 */
export const StepSelectItems = memo(function StepSelectItems({
  order,
  draft,
  onQuantityChange,
}: StepSelectItemsProps) {
  const returnableItems = order.items.filter((item) => item.returnEligible);
  const selectedCount = Object.values(draft.selections).reduce((sum, qty) => sum + qty, 0);

  const returnedValue =
    returnableItems.reduce((sum, item) => {
      const qty = draft.selections[item.id] ?? 0;
      return sum + item.unitPriceCents * qty;
    }, 0) / 100;

  return (
    <div className="space-y-4">
      {returnableItems.length === 0 ? (
        <p className="text-sm text-muted">None of the items in this order are returnable.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {returnableItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                selectedQty={draft.selections[item.id] ?? 0}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </ul>

          <div className="rounded-lg border border-line bg-canvas px-3 py-2">
            <p className="flex items-center justify-between text-sm">
              <span className="text-muted">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
              </span>
              <span className="font-semibold text-ink">
                {formatMoney(Math.round(returnedValue * 100))}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
});

const ItemRow = memo(function ItemRow({ item, selectedQty, onQuantityChange }: any) {
  const handleChange = useCallback(
    (value: string) => {
      onQuantityChange(item.id, parseInt(value, 10));
    },
    [item.id, onQuantityChange],
  );

  return (
    <li className="flex items-center gap-3">
      <ItemThumb name={item.name} color={item.thumbColor} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{item.name}</p>
        <p className="text-sm text-muted">{formatMoney(item.unitPriceCents)} each</p>
      </div>
      <select
        value={selectedQty}
        onChange={(e) => handleChange(e.target.value)}
        aria-label={`Return quantity for ${item.name}`}
        className="h-9 rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none"
      >
        {QUANTITY_LIMITS.map((n) => (
          <option key={n} value={n} disabled={n > item.quantity}>
            {n > 0 ? `Return ${n}` : 'Return none'}
          </option>
        ))}
      </select>
    </li>
  );
});
