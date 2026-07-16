import { useQuery } from '@tanstack/react-query';
import { getOrder, orderKeys } from '@/services';

/** Fetches a single order by id (order detail + return flow). */
export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ''),
    queryFn: ({ signal }) => getOrder(orderId!, signal),
    enabled: Boolean(orderId),
  });
}
