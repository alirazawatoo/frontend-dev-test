import { memo, type ReactNode } from 'react';
import { cn } from '../../lib';

type BadgeProps = {
  children: ReactNode;
  /** Tailwind color classes (e.g. from STATUS_META). */
  className?: string;
};

/** Small pill label. Memoized — it renders once per list row. */
export const Badge = memo(function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  );
});
