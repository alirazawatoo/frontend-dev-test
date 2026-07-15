import { memo, useId } from 'react';
import { Field, Select, Textarea } from '../../components';
import { RETURN_REASONS } from '../../lib';
import type { ReturnDraft } from '../../types';

const COMMENT_MAX_LENGTH = 500;

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

      <Field
        label="Comments (optional)"
        htmlFor={commentId}
        hint={`${draft.comment.length}/${COMMENT_MAX_LENGTH} characters`}
      >
        <Textarea
          id={commentId}
          value={draft.comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Anything that helps us sort it out quickly"
          rows={4}
          maxLength={COMMENT_MAX_LENGTH}
        />
      </Field>
    </div>
  );
});
