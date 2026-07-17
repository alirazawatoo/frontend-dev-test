import { memo } from 'react';
import { Badge } from '@/components';
import { STATUS_META } from '@/lib';
import type { OrderStatus } from '@/types';

/** Status pill with brand-correct color per order status. */
export const StatusBadge = memo(function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return <Badge className={meta.className}>{meta.label}</Badge>;
});
