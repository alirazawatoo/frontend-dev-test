import { memo } from 'react';
import { cn } from '../../lib';

type ItemThumbProps = {
  name: string;
  color?: string;
  className?: string;
};

/**
 * Product thumbnail placeholder. The mock data has no images, so we render a
 * tinted swatch (from the item's thumbColor) with the product's initial.
 */
export const ItemThumb = memo(function ItemThumb({ name, color, className }: ItemThumbProps) {
  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-ink/70',
        className,
      )}
      style={{ backgroundColor: color ?? 'var(--brand-soft)' }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
});
