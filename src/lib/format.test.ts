import { describe, expect, it } from 'vitest';
import { ApiError } from '../services';
import { formatDate } from './date';
import { getErrorMessage } from './errors';

describe('formatDate', () => {
  it('formats ISO dates without shifting the day across time zones', () => {
    expect(formatDate('2026-06-03')).toBe('3 Jun 2026');
    expect(formatDate('2026-12-31')).toBe('31 Dec 2026');
  });

  it('passes through values it cannot parse', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('getErrorMessage', () => {
  it('uses the API message, which is already shopper-facing', () => {
    expect(getErrorMessage(new ApiError(503, 'The orders service is down.'))).toBe(
      'The orders service is down.',
    );
  });

  it('describes cancelled requests', () => {
    expect(getErrorMessage(new DOMException('Aborted', 'AbortError'))).toBe('The request was cancelled.');
  });

  it('falls back to a generic message', () => {
    expect(getErrorMessage('boom')).toBe('Something went wrong. Please try again.');
    expect(getErrorMessage(new Error(''))).toBe('Something went wrong. Please try again.');
  });
});
