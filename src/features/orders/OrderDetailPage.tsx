import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button, ErrorState, ItemThumb, Skeleton } from '../../components';
import { useOrder } from '../../hooks';
import { formatDate, formatMoney, lineTotalCents, orderTotalCents } from '../../lib';
import type { Order } from '../../types';
import { StatusBadge } from './StatusBadge';

/** Order detail: line items, total, and (for delivered orders) a return CTA. */
export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError, error, refetch, isFetching } = useOrder(orderId);

  return (
    <section className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to orders
      </Link>

      {isLoading && <OrderDetailSkeleton />}

      {isError && (
        <ErrorState
          title="We couldn't load that order"
          error={error}
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      )}

      {order && <OrderDetail order={order} />}
    </section>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const total = useMemo(() => orderTotalCents(order), [order]);
  const canReturn = order.status === 'delivered';

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted">Placed {formatDate(order.placedAt)}</p>
        </div>
        {canReturn && (
          <Button asChild={false} className="shrink-0" onClick={undefined}>
            <Link to={`/orders/${order.id}/return`} className="contents">
              <RotateCcw className="size-4" aria-hidden />
              Return or exchange
            </Link>
          </Button>
        )}
      </header>

      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-4">
              <ItemThumb name={item.name} color={item.thumbColor} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.name}</p>
                <p className="text-sm text-muted">
                  {formatMoney(item.unitPriceCents)} × {item.quantity}
                  {!item.returnEligible && (
                    <span className="ml-2 text-xs text-muted">· Not returnable</span>
                  )}
                </p>
              </div>
              <span className="font-medium text-ink">
                {formatMoney(lineTotalCents(item.unitPriceCents, item.quantity))}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line bg-canvas px-4 py-3">
          <span className="text-sm font-medium text-muted">Order total</span>
          <span className="text-lg font-semibold text-ink">{formatMoney(total)}</span>
        </div>
      </div>

      {!canReturn && (
        <p className="text-sm text-muted">
          Returns open once an order has been delivered.
        </p>
      )}
    </>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-8 w-40" />
      <div className="rounded-card border border-line bg-surface p-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 py-3">
            <Skeleton className="size-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
