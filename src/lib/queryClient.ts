import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../services/mockApi';

/** Don't waste retries on errors that won't change on their own. */
function isTerminalError(error: unknown): boolean {
  // Aborted requests are intentional (navigation / new query) — never retry.
  if (error instanceof DOMException && (error as DOMException).name === 'AbortError') return true;
  // 404 (not found) and 422 (validation) are deterministic — retrying won't help.
  if (error instanceof ApiError) return (error as ApiError).status === 404 || (error as ApiError).status === 422;
  return false;
}

/**
 * Shared React Query client.
 *
 * Reads retry transient failures (the mock API fails ~12% of list calls) with
 * exponential backoff. Mutations deliberately do NOT auto-retry — a return
 * submission creates a record, so re-firing it silently could double-submit;
 * the UI offers an explicit "Try again" instead.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !isTerminalError(error) && failureCount < 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
