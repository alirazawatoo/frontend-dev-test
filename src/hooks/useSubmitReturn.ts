import { useMutation } from '@tanstack/react-query';
import { submitReturn } from '../services';
import type { ReturnReceipt, ReturnRequest } from '../types';

/**
 * Submits a return request.
 *
 * Retry is intentionally disabled (see lib/queryClient) — the caller surfaces an
 * explicit "Try again" so a create-type POST is never silently re-fired. Callers
 * should also guard the submit button with `isPending` to prevent double taps.
 */
export function useSubmitReturn() {
  return useMutation<ReturnReceipt, Error, ReturnRequest>({
    mutationFn: (request) => submitReturn(request),
  });
}
