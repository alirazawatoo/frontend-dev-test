import { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, ErrorState, Spinner, Stepper } from '@/components';
import { useOrder, useReturnDraft, useSubmitReturn } from '@/hooks';
import { cn, returnedValueCents } from '@/lib';
import type { ReturnRequest, ReturnStep } from '@/types';
import { StepSelectItems } from './StepSelectItems';
import { StepReason } from './StepReason';
import { StepResolution } from './StepResolution';
import { StepReview } from './StepReview';
import { SuccessScreen } from './SuccessScreen';

/**
 * Guided multi-step return flow: select items → reason → resolution → review → submit.
 * All state is tracked in the draft; on submit it's mapped to a ReturnRequest.
 */
export function ReturnFlowPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError, error } = useOrder(orderId);

  const draft = useReturnDraft();
  const {
    mutate: submit,
    isPending: isSubmitting,
    isError: submitError,
    error: submitErrorValue,
    data: receipt,
  } = useSubmitReturn();

  const currentStep = useMemo<ReturnStep | null>(() => {
    if (!draft.draft.selections || Object.keys(draft.draft.selections).length === 0)
      return 'items';
    if (!draft.draft.reason) return 'reason';
    if (!draft.draft.resolution) return 'resolution';
    return 'review';
  }, [draft.draft]);

  const steps: { key: ReturnStep; label: string }[] = [
    { key: 'items', label: 'Items' },
    { key: 'reason', label: 'Reason' },
    { key: 'resolution', label: 'Resolution' },
    { key: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);
  const isCurrentStepValid = currentStep === 'review' && draft.draft.resolution !== null;

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      // just move to the next step; form fields handle their own validation hints
    }
  }, [currentStepIndex, steps.length]);

  const handleSubmit = useCallback(() => {
    if (!order || !isCurrentStepValid) return;

    const returnableItems = order.items.filter((item) => item.returnEligible);
    const value = returnedValueCents(returnableItems, draft.draft.selections);

    const request: ReturnRequest = {
      orderId: order.id,
      items: Object.entries(draft.draft.selections)
        .filter(([, qty]) => qty > 0)
        .map(([itemId, quantity]) => ({ itemId, quantity })),
      reason: draft.draft.reason,
      resolution: draft.draft.resolution!,
      comment: draft.draft.comment || undefined,
    };

    submit(request);
  }, [order, draft.draft, submit, isCurrentStepValid]);

  // Early return if the order wasn't found or isn't delivered.
  if (!isLoading && (!order || order.status !== 'delivered')) {
    return (
      <section className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to orders
        </Link>
        <ErrorState
          title="Can't start a return"
          error={new Error('This order is not eligible for returns.')}
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner label="Loading order details" />
      </div>
    );
  }

  if (isError) {
    return (
      <section className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to orders
        </Link>
        <ErrorState
          title="We couldn't load that order"
          error={error}
        />
      </section>
    );
  }

  // Success screen
  if (receipt) {
    return (
      <section className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to orders
        </Link>
        <SuccessScreen receipt={receipt} />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        to={`/orders/${orderId}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to order
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-ink">Return or exchange</h1>
        <p className="mt-1 text-sm text-muted">
          We'll guide you through the return process.
        </p>
      </div>

      <Stepper steps={steps} currentIndex={currentStepIndex} />

      {/* Step content */}
      <div
        className={cn(
          'rounded-card border border-line bg-surface p-6',
          submitError && 'ring-1 ring-danger',
        )}
      >
        {currentStep === 'items' && (
          <StepSelectItems
            order={order}
            draft={draft.draft}
            onQuantityChange={draft.setQuantity}
          />
        )}
        {currentStep === 'reason' && (
          <StepReason
            draft={draft.draft}
            onReasonChange={draft.setReason}
            onCommentChange={draft.setComment}
          />
        )}
        {currentStep === 'resolution' && (
          <StepResolution
            order={order}
            draft={draft.draft}
            onResolutionChange={draft.setResolution}
          />
        )}
        {currentStep === 'review' && <StepReview order={order} draft={draft.draft} />}
      </div>

      {submitError && (
        <ErrorState
          title="We couldn't process your return"
          error={submitErrorValue}
          onRetry={handleSubmit}
          retrying={isSubmitting}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStepIndex > 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              // Move back by unsetting the field(s) that determine the current step.
              if (currentStep === 'reason') draft.setQuantity('', 0); // clears selections
              else if (currentStep === 'resolution') draft.setReason('');
              else if (currentStep === 'review') draft.setResolution(null);
            }}
          >
            Back
          </Button>
        )}
        {currentStep !== 'review' && (
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 'items' && draft.selectedCount === 0) ||
              (currentStep === 'reason' && !draft.draft.reason)
            }
          >
            Next
          </Button>
        )}
        {currentStep === 'review' && (
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isCurrentStepValid}
          >
            Submit return
          </Button>
        )}
      </div>
    </section>
  );
}
