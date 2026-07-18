import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ItemThumb } from '@/components';
import { formatDate, formatMoney, orderTotalCents } from '@/lib';
import type { Order } from '@/types';
import { StatusBadge } from './StatusBadge';

/** A single order in the dashboard list. Memoized — the list re-renders often. */
export const OrderCard = memo(function OrderCard({ order }: { order: Order }) {
  // Total is derived per order; memoize so it isn't recomputed on parent renders.
  const total = useMemo(() => orderTotalCents(order), [order]);
  const itemCount = useMemo(
    () => order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items],
  );

  return (
    <Link
      to={`/orders/${order.id}`}
      className="group block rounded-card border border-line bg-surface p-4 transition-colors hover:border-accent sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{order.orderNumber}</p>
          <p className="text-sm text-muted">
            Placed {formatDate(order.placedAt)} · {itemCount}{' '}
            {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        {order.items.slice(0, 4).map((item) => (
          <ItemThumb key={item.id} name={item.name} color={item.thumbColor} />
        ))}
        {order.items.length > 4 && (
          <span className="text-xs text-muted">+{order.items.length - 4}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <span className="text-sm text-muted">
          Total{' '}
          <span className="font-semibold text-ink">{formatMoney(total)}</span>
        </span>
        <span className="flex items-center gap-0.5 text-sm font-medium text-accent-deep">
          View
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
});
