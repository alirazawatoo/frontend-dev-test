import { cn } from '../../lib';

type SkeletonProps = {
  className?: string;
};

/** Neutral shimmering placeholder used while content loads. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-line/70', className)}
      aria-hidden
    />
  );
}
