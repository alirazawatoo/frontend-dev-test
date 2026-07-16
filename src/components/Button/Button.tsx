import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-hover disabled:hover:bg-brand',
  secondary:
    'bg-surface text-ink border border-line hover:bg-brand-soft disabled:hover:bg-surface',
  ghost: 'bg-transparent text-accent-deep hover:bg-accent-soft',
  danger: 'bg-danger text-white hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
};

/** App-wide button. Handles variants, sizing, and an inline loading state. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
