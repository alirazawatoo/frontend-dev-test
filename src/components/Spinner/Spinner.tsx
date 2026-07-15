import { Loader2 } from 'lucide-react';
import { cn } from '../../lib';

type SpinnerProps = {
  className?: string;
  label?: string;
};

/** Accessible loading spinner. */
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite">
      <Loader2 className={cn('size-5 animate-spin text-accent', className)} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
