import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Dim controls while the next page is loading. */
  busy?: boolean;
};

/** Prev/next pager with a page indicator. Hidden when there's a single page. */
export function Pagination({ page, totalPages, onPageChange, busy }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between gap-4"
      aria-label="Pagination"
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || busy}
      >
        <ChevronLeft className="size-4" aria-hidden />
        Previous
      </Button>

      <p className="text-sm text-muted" aria-live="polite">
        Page <span className="font-semibold text-ink">{page}</span> of {totalPages}
      </p>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || busy}
      >
        Next
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </nav>
  );
}
