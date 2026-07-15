import { memo } from 'react';
import { ItemThumb } from '../../components';
import { formatMoney, returnedValueCents } from '../../lib';
import type { Order, OrderItem, ReturnDraft } from '../../types';

type StepSelectItemsProps = {
  order: Order;
  draft: ReturnDraft;
  onQuantityChange: (itemId: string, quantity: number) => void;
};

/**
 * Step 1: Select returnable items and quantities.
 * Quantity options stop at the ordered quantity; non-returnable lines stay
 * visible but disabled so the shopper can see why they are missing.
 */
export const StepSelectItems = memo(function StepSelectItems({
  order,
  draft,
  onQuantityChange,
}: StepSelectItemsProps) {
  const returnableItems = order.items.filter((item) => item.returnEligible);
  const selectedCount = Object.values(draft.selections).reduce((sum, qty) => sum + qty, 0);
  const returnedValue = returnedValueCents(returnableItems, draft.selections);

  if (returnableItems.length === 0) {
    return <p className="text-sm text-muted">None of the items in this order are returnable.</p>;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {order.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            selectedQty={draft.selections[item.id] ?? 0}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </ul>

      <div className="rounded-lg border border-line bg-canvas px-3 py-2">
        <p className="flex items-center justify-between text-sm" aria-live="polite">
          <span className="text-muted">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          <span className="font-semibold text-ink">{formatMoney(returnedValue)}</span>
        </p>
      </div>
    </div>
  );
});

type ItemRowProps = {
  item: OrderItem;
  selectedQty: number;
  onQuantityChange: (itemId: string, quantity: number) => void;
};

const ItemRow = memo(function ItemRow({ item, selectedQty, onQuantityChange }: ItemRowProps) {
  const quantities = Array.from({ length: item.quantity + 1 }, (_, n) => n);

  return (
    <li className="flex flex-wrap items-center gap-3">
      <ItemThumb name={item.name} color={item.thumbColor} />
      <div className="min-w-0 flex-1">
        <p className="break-words font-medium text-ink">{item.name}</p>
        <p className="text-sm text-muted">
          {formatMoney(item.unitPriceCents)} each · {item.quantity} ordered
        </p>
      </div>
      {item.returnEligible ? (
        <select
          value={selectedQty}
          onChange={(e) => onQuantityChange(item.id, Number(e.target.value))}
          aria-label={`Return quantity for ${item.name}`}
          className="h-9 rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none"
        >
          {quantities.map((n) => (
            <option key={n} value={n}>
              {n > 0 ? `Return ${n}` : 'Return none'}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-sm text-muted">Not returnable</span>
      )}
    </li>
  );
});
