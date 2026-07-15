import { memo, useId } from 'react';
import { Field, Select, Textarea } from '../../components';
import { RETURN_REASONS } from '../../lib';
import type { ReturnDraft } from '../../types';

type StepReasonProps = {
  draft: ReturnDraft;
  onReasonChange: (reason: string) => void;
  onCommentChange: (comment: string) => void;
};

/**
 * Step 2: Select a return reason and optionally add a comment.
 * Both fit on desktop, stack on mobile.
 */
export const StepReason = memo(function StepReason({
  draft,
  onReasonChange,
  onCommentChange,
}: StepReasonProps) {
  const reasonId = useId();
  const commentId = useId();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Reason for return" htmlFor={reasonId}>
        <Select
          id={reasonId}
          value={draft.reason}
          onChange={(e) => onReasonChange(e.target.value)}
          required
        >
          <option value="">— Select one —</option>
          {RETURN_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Comments (optional)" htmlFor={commentId}>
        <Textarea
          id={commentId}
          value={draft.comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Tell us more..."
          rows={4}
        />
      </Field>
    </div>
  );
});
