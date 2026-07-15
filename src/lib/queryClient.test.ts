import { describe, expect, it } from 'vitest';
import { ApiError } from '../services';
import { isTerminalError, queryClient } from './queryClient';

describe('isTerminalError', () => {
  it('treats aborts, 404 and 422 as final', () => {
    expect(isTerminalError(new DOMException('Aborted', 'AbortError'))).toBe(true);
    expect(isTerminalError(new ApiError(404, 'missing'))).toBe(true);
    expect(isTerminalError(new ApiError(422, 'invalid'))).toBe(true);
  });

  it('treats server and unknown errors as transient', () => {
    expect(isTerminalError(new ApiError(503, 'down'))).toBe(false);
    expect(isTerminalError(new Error('network'))).toBe(false);
  });
});

describe('queryClient defaults', () => {
  const { queries, mutations } = queryClient.getDefaultOptions();
  const retry = queries?.retry as (count: number, error: unknown) => boolean;

  it('retries transient read failures up to three times', () => {
    const outage = new ApiError(503, 'down');
    expect(retry(0, outage)).toBe(true);
    expect(retry(2, outage)).toBe(true);
    expect(retry(3, outage)).toBe(false);
  });

  it('never retries terminal read failures', () => {
    expect(retry(0, new ApiError(404, 'missing'))).toBe(false);
  });

  it('never retries writes automatically', () => {
    expect(mutations?.retry).toBe(false);
  });
});
