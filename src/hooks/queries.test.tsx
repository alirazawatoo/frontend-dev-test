import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as services from '../services';
import { ApiError } from '../services';
import { createTestQueryClient } from '../test/render';
import { deliveredOrder, pageOf } from '../test/fixtures';
import { useOrder } from './useOrder';
import { useOrders } from './useOrders';
import { useSubmitReturn } from './useSubmitReturn';

vi.mock('../services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services')>()),
  listOrders: vi.fn(),
  getOrder: vi.fn(),
  submitReturn: vi.fn(),
}));

const api = vi.mocked(services);

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useOrders', () => {
  it('passes the query params and an abort signal to listOrders', async () => {
    api.listOrders.mockResolvedValue(pageOf([deliveredOrder]));
    const params = { page: 2, pageSize: 4, status: 'delivered' as const, query: 'lamp' };

    const { result } = renderHook(() => useOrders(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listOrders).toHaveBeenCalledWith({ ...params, signal: expect.any(AbortSignal) });
    expect(result.current.data?.data[0].id).toBe('o_1');
  });
});

describe('useOrder', () => {
  it('does not fetch without an order id', () => {
    renderHook(() => useOrder(undefined), { wrapper });
    expect(api.getOrder).not.toHaveBeenCalled();
  });

  it('surfaces a 404 as an error', async () => {
    api.getOrder.mockRejectedValue(new ApiError(404, "We couldn't find that order."));
    const { result } = renderHook(() => useOrder('o_missing'), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 404 });
  });
});

describe('useSubmitReturn', () => {
  const request = {
    orderId: 'o_1',
    items: [{ itemId: 'i_lamp', quantity: 1 }],
    reason: 'Wrong item sent',
    resolution: 'refund' as const,
  };

  it('does not silently re-send a failed submission', async () => {
    api.submitReturn.mockRejectedValue(new ApiError(500, 'Try again'));
    const { result } = renderHook(() => useSubmitReturn(), { wrapper });

    act(() => result.current.mutate(request));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(api.submitReturn).toHaveBeenCalledTimes(1);
  });

  it('returns the receipt on success', async () => {
    api.submitReturn.mockResolvedValue({ returnId: 'rma_abc123', createdAt: '2026-06-10T10:00:00Z' });
    const { result } = renderHook(() => useSubmitReturn(), { wrapper });

    act(() => result.current.mutate(request));

    await waitFor(() => expect(result.current.data?.returnId).toBe('rma_abc123'));
    expect(api.submitReturn.mock.calls[0][0]).toEqual(request);
  });
});
