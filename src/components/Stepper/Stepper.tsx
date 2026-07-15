import { Check } from 'lucide-react';
import { cn } from '../../lib';

export type Step = {
  key: string;
  label: string;
};

type StepperProps = {
  steps: Step[];
  /** Zero-based index of the active step. */
  currentIndex: number;
};

/** Horizontal progress indicator for the multi-step return flow. */
export function Stepper({ steps, currentIndex }: StepperProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Return progress">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                isComplete && 'bg-brand text-white',
                isCurrent && 'bg-accent text-white',
                !isComplete && !isCurrent && 'bg-line text-muted',
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isComplete ? <Check className="size-4" aria-hidden /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden text-sm font-medium sm:inline',
                isCurrent ? 'text-ink' : 'text-muted',
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  'ml-1 h-px flex-1',
                  isComplete ? 'bg-brand' : 'bg-line',
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
