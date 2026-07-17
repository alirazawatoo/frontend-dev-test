import { useCallback, useEffect, useMemo, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { Button, EmptyState, ErrorState } from '@/components';
import { useDebouncedValue, useOrders } from '@/hooks';
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS, cn } from '@/lib';
import type { StatusFilter } from '@/types';
import { OrderCard } from './OrderCard';
import { OrdersSkeleton } from './OrdersSkeleton';
import { Pagination } from './Pagination';
import { SearchBox } from './SearchBox';
import { StatusFilterSelect } from './StatusFilterSelect';

/** Orders dashboard: browse, filter, search, and paginate past orders. */
export function OrdersPage() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  // Any change to the filters should bring the shopper back to the first page.
  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const { data, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    useOrders({
      page,
      pageSize: PAGE_SIZE,
      status,
      query: debouncedSearch,
    });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const filtersActive = status !== 'all' || debouncedSearch.trim() !== '';

  const clearFilters = useCallback(() => {
    setStatus('all');
    setSearch('');
  }, []);

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const content = useMemo(() => {
    if (isLoading) return <OrdersSkeleton />;

    if (isError) {
      return (
        <ErrorState
          title="We couldn't load your orders"
          error={error}
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      );
    }

    if (!data || data.data.length === 0) {
      return (
        <EmptyState
          icon={PackageSearch}
          title={filtersActive ? 'No matching orders' : 'No orders yet'}
          description={
            filtersActive
              ? 'Try a different search or clear your filters.'
              : 'When you place an order, it will show up here.'
          }
          action={
            filtersActive && (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* keepPreviousData keeps the old page visible; dim it while refetching. */}
        <div
          className={cn(
            'grid gap-3 transition-opacity',
            isPlaceholderData && 'opacity-60',
          )}
        >
          {data.data.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          busy={isPlaceholderData}
        />
      </div>
    );
  }, [
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    data,
    filtersActive,
    clearFilters,
    isPlaceholderData,
    page,
    totalPages,
    handlePageChange,
  ]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Your orders</h1>
        <p className="mt-1 text-sm text-muted">
          Track past orders, and start a return or exchange.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBox value={search} onChange={setSearch} />
        <StatusFilterSelect value={status} onChange={setStatus} />
      </div>

      {data && !isError && (
        <p className="text-sm text-muted" aria-live="polite">
          {data.total} {data.total === 1 ? 'order' : 'orders'}
        </p>
      )}

      {content}
    </section>
  );
}
