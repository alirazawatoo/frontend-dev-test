import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../components';
import type { ReturnReceipt } from '../../types';

type SuccessScreenProps = {
  receipt: ReturnReceipt;
};

/** Confirmation shown after a successful return submission. */
export function SuccessScreen({ receipt }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 rounded-card border border-success/20 bg-success-soft px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="size-8 text-success" aria-hidden />
      </span>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink">Return submitted</h1>
        <p className="text-sm text-muted">
          We've received your return request and will process it soon.
        </p>
      </div>

      <div className="rounded-lg bg-surface px-4 py-2">
        <p className="text-xs text-muted">Return ID</p>
        <p className="font-mono text-sm font-semibold text-ink">{receipt.returnId}</p>
      </div>

      <Button asChild={false} onClick={undefined}>
        <Link to="/" className="contents">
          Back to orders
        </Link>
      </Button>
    </div>
  );
}
