import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiError, apiConfig, getOrder, listOrders, submitReturn } from './mockApi';

// The mock API is the fixed contract the app builds against. These tests pin
// down the behaviour the service layer relies on, with latency and random
// failures switched off.
const original = { ...apiConfig };

beforeEach(() => {
  Object.assign(apiConfig, { minLatencyMs: 0, maxLatencyMs: 0, listFailureRate: 0, submitFailureRate: 0 });
});

afterEach(() => {
  Object.assign(apiConfig, original);
});

describe('listOrders', () => {
  it('pages through all orders with a default page size of 4', async () => {
    const first = await listOrders();
    expect(first.page).toBe(1);
    expect(first.pageSize).toBe(4);
    expect(first.data).toHaveLength(4);

    const last = await listOrders({ page: Math.ceil(first.total / 4) });
    expect(last.data.length).toBeGreaterThan(0);
    expect(last.data.length).toBeLessThanOrEqual(4);
  });

  it('filters by status', async () => {
    const { data, total } = await listOrders({ status: 'cancelled', pageSize: 50 });
    expect(total).toBe(data.length);
    expect(data.every((order) => order.status === 'cancelled')).toBe(true);
  });

  it('searches order numbers and product names case-insensitively', async () => {
    const byNumber = await listOrders({ query: 'sp-10432' });
    expect(byNumber.data.map((o) => o.orderNumber)).toEqual(['SP-10432']);

    const byProduct = await listOrders({ query: '  YOGA ' });
    expect(byProduct.data).toHaveLength(1);
    expect(byProduct.data[0].items[0].name).toBe('Verde Yoga Mat');
  });

  it('returns an empty page when nothing matches', async () => {
    const result = await listOrders({ query: 'no-such-product' });
    expect(result).toMatchObject({ data: [], total: 0 });
  });

  it('fails with a 503 ApiError when the service is down', async () => {
    apiConfig.listFailureRate = 1;
    await expect(listOrders()).rejects.toMatchObject({ name: 'ApiError', status: 503 });
  });

  it('rejects with an AbortError when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(listOrders({ signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('getOrder', () => {
  it('returns a single order', async () => {
    const order = await getOrder('o_10432');
    expect(order.orderNumber).toBe('SP-10432');
  });

  it('throws a 404 ApiError for an unknown id', async () => {
    const error = await getOrder('o_missing').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404 });
  });
});

describe('submitReturn', () => {
  const request = {
    orderId: 'o_10432',
    items: [{ itemId: 'i_1', quantity: 1 }],
    reason: 'Wrong item sent',
    resolution: 'refund' as const,
  };

  it('returns a receipt with an rma id and timestamp', async () => {
    const receipt = await submitReturn(request);
    expect(receipt.returnId).toMatch(/^rma_[a-z0-9]+$/);
    expect(Number.isNaN(Date.parse(receipt.createdAt))).toBe(false);
  });

  it('rejects an empty selection with a 422', async () => {
    await expect(submitReturn({ ...request, items: [] })).rejects.toMatchObject({ status: 422 });
  });

  it('can fail transiently with a 500', async () => {
    apiConfig.submitFailureRate = 1;
    await expect(submitReturn(request)).rejects.toMatchObject({ status: 500 });
  });
});
