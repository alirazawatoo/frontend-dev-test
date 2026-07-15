import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
};

/** App-wide button. Handles variants, sizing, and an inline loading state. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant, size, loading = false, disabled, className, children, type = 'button', ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
