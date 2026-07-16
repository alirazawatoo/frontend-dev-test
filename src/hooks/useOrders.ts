import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listOrders, orderKeys, type OrdersQuery } from '@/services';

/**
 * Fetches a page of orders for the dashboard.
 *
 * `keepPreviousData` keeps the current page on screen while the next one loads,
 * so paginating / filtering doesn't flash a skeleton. The AbortSignal is wired
 * through so in-flight requests are cancelled when params change or we unmount.
 */
export function useOrders(params: OrdersQuery) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: ({ signal }) =>
      listOrders({
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        query: params.query,
        signal,
      }),
    placeholderData: keepPreviousData,
  });
}
