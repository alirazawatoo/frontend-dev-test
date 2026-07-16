import { AlertTriangle } from 'lucide-react';
import { getErrorMessage } from '@/lib';
import { Button } from '../Button';

type ErrorStateProps = {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

/** Failure state with a friendly message and an optional retry. */
export function ErrorState({
  error,
  title = "That didn't go through",
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-card border border-danger/20 bg-danger-soft px-6 py-16 text-center"
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry} loading={retrying}>
          Try again
        </Button>
      )}
    </div>
  );
}
