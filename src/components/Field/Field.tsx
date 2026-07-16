import {
  forwardRef,
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib';

const controlClasses =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink ' +
  'placeholder:text-muted focus:border-accent focus:outline-none';

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Label + optional hint/error wrapper shared by form controls. */
export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(controlClasses, 'pr-8', className)} {...props} />
));
Select.displayName = 'Select';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(controlClasses, 'resize-y', className)} {...props} />
));
Textarea.displayName = 'Textarea';

/** Convenience: generate a stable id when a caller doesn't supply one. */
export function useFieldId(provided?: string): string {
  const generated = useId();
  return provided ?? generated;
}
