import { ApiError } from '../services/mockApi';

/** Turn any thrown value into a shopper-friendly message. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // The mock API's messages are already user-facing; pass them through.
    return error.message;
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'The request was cancelled.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
