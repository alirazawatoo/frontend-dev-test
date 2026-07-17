import { Skeleton } from '@/components';
import { PAGE_SIZE } from '@/lib';

/** Placeholder cards shown while the first page of orders loads. */
export function OrdersSkeleton() {
  return (
    <div className="grid gap-3" aria-hidden>
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <div key={index} className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="size-10" />
            <Skeleton className="size-10" />
          </div>
          <Skeleton className="mt-4 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
