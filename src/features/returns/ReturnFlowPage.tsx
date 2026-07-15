import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, ErrorState, Spinner, Stepper } from '../../components';
import { useOrder, useReturnDraft, useSubmitReturn } from '../../hooks';
import type { Order, ReturnDraft, ReturnRequest, ReturnStep } from '../../types';
import { StepSelectItems } from './StepSelectItems';
import { StepReason } from './StepReason';
import { StepResolution } from './StepResolution';
import { StepReview } from './StepReview';
import { SuccessScreen } from './SuccessScreen';

const STEPS: { key: ReturnStep; label: string; blockedHint: string }[] = [
  { key: 'items', label: 'Items', blockedHint: 'Choose at least one item to continue.' },
  { key: 'reason', label: 'Reason', blockedHint: 'Pick a reason to continue.' },
  { key: 'resolution', label: 'Resolution', blockedHint: 'Choose how you would like to be refunded.' },
  { key: 'review', label: 'Review', blockedHint: '' },
];

function isStepComplete(step: ReturnStep, draft: ReturnDraft): boolean {
  switch (step) {
    case 'items':
      return Object.values(draft.selections).some((qty) => qty > 0);
    case 'reason':
      return draft.reason !== '';
    case 'resolution':
    case 'review':
      return draft.resolution !== null;
  }
}

function toReturnRequest(order: Order, draft: ReturnDraft): ReturnRequest | null {
  if (!draft.resolution) return null;
  return {
    orderId: order.id,
    items: Object.entries(draft.selections)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity })),
    reason: draft.reason,
    resolution: draft.resolution,
    comment: draft.comment.trim() || undefined,
  };
}

function BackToOrders({ to = '/', label = 'Back to orders' }: { to?: string; label?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

/**
 * Guided multi-step return flow: select items → reason → resolution → review → submit.
 * The step index is explicit state; each step only gates the Next button, so
 * going back never discards what the shopper already entered.
 */
export function ReturnFlowPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError, error, refetch, isFetching } = useOrder(orderId);
  const { draft, setQuantity, setReason, setComment, setResolution } = useReturnDraft();
  const submission = useSubmitReturn();
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex];
  const canAdvance = isStepComplete(step.key, draft);

  // Move focus to the step heading after Next/Back so screen-reader and
  // keyboard users land on the new content instead of a vanished button.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  useEffect(() => {
    if (hasNavigated.current) headingRef.current?.focus();
  }, [stepIndex]);

  const goTo = useCallback((index: number) => {
    hasNavigated.current = true;
    setStepIndex(index);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!order || submission.isPending) return;
    const request = toReturnRequest(order, draft);
    if (request) submission.mutate(request);
  }, [order, draft, submission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner label="Loading order details" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <section className="space-y-6">
        <BackToOrders />
        <ErrorState
          title="We couldn't load that order"
          error={error}
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      </section>
    );
  }

  if (order.status !== 'delivered') {
    return (
      <section className="space-y-6">
        <BackToOrders to={`/orders/${order.id}`} label="Back to order" />
        <ErrorState
          title="Can't start a return"
          error={new Error('Returns open once an order has been delivered.')}
        />
      </section>
    );
  }

  if (submission.data) {
    return (
      <section className="space-y-6">
        <BackToOrders />
        <SuccessScreen receipt={submission.data} />
      </section>
    );
  }

  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <section className="space-y-6">
      <BackToOrders to={`/orders/${order.id}`} label="Back to order" />

      <div>
        <h1 className="text-2xl font-semibold text-ink">Return or exchange</h1>
        <p className="mt-1 text-sm text-muted">
          Order {order.orderNumber} · we'll guide you through it in four short steps.
        </p>
      </div>

      <Stepper steps={STEPS} currentIndex={stepIndex} />

      <div className="rounded-card border border-line bg-surface p-4 sm:p-6">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted focus:outline-none"
        >
          Step {stepIndex + 1} of {STEPS.length}: {step.label}
        </h2>
        {step.key === 'items' && (
          <StepSelectItems order={order} draft={draft} onQuantityChange={setQuantity} />
        )}
        {step.key === 'reason' && (
          <StepReason draft={draft} onReasonChange={setReason} onCommentChange={setComment} />
        )}
        {step.key === 'resolution' && (
          <StepResolution order={order} draft={draft} onResolutionChange={setResolution} />
        )}
        {step.key === 'review' && <StepReview order={order} draft={draft} />}
      </div>

      {submission.isError && (
        <ErrorState
          title="We couldn't process your return"
          error={submission.error}
          onRetry={handleSubmit}
          retrying={submission.isPending}
        />
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        {stepIndex > 0 && (
          <Button
            variant="secondary"
            onClick={() => goTo(stepIndex - 1)}
            disabled={submission.isPending}
          >
            Back
          </Button>
        )}
        {isLastStep ? (
          <Button
            onClick={handleSubmit}
            loading={submission.isPending}
            disabled={!canAdvance}
          >
            Submit return
          </Button>
        ) : (
          <Button onClick={() => goTo(stepIndex + 1)} disabled={!canAdvance}>
            Next
          </Button>
        )}
        {!canAdvance && step.blockedHint && (
          <p className="text-sm text-muted" aria-live="polite">
            {step.blockedHint}
          </p>
        )}
      </div>
    </section>
  );
}
