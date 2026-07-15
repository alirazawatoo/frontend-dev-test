import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover disabled:hover:bg-brand',
  secondary:
    'bg-surface text-ink border border-line hover:bg-brand-soft disabled:hover:bg-surface',
  ghost: 'bg-transparent text-accent-deep hover:bg-accent-soft',
  danger: 'bg-danger text-white hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
};

/** Shared by <Button> and <ButtonLink> so a link styled as a button stays a single element. */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
    SIZES[size],
    VARIANTS[variant],
    className,
  );
}
