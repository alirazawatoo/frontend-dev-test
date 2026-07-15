/**
 * Service layer over the mock backend.
 *
 * The rest of the app imports from here (never from mockApi directly), so query
 * keys and the network surface live in one place. If the real API arrived, this
 * is the only file that would change.
 */
import {
  getOrder,
  listOrders,
  submitReturn,
  type ListParams,
} from './mockApi';

export type OrdersQuery = {
  page: number;
  pageSize: number;
  status: NonNullable<ListParams['status']>;
  query: string;
};

/** Stable, hierarchical React Query keys for the orders domain. */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrdersQuery) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export { getOrder, listOrders, submitReturn };
export { ApiError } from './mockApi';
