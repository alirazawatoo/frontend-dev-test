import { describe, expect, it } from 'vitest';
import { orderKeys } from './orders';

describe('orderKeys', () => {
  it('nests list and detail keys under the orders root', () => {
    const params = { page: 2, pageSize: 4, status: 'delivered' as const, query: 'lamp' };
    expect(orderKeys.list(params)).toEqual(['orders', 'list', params]);
    expect(orderKeys.detail('o_1')).toEqual(['orders', 'detail', 'o_1']);
    expect(orderKeys.list(params).slice(0, 2)).toEqual([...orderKeys.lists()]);
    expect(orderKeys.detail('o_1').slice(0, 2)).toEqual([...orderKeys.details()]);
  });
});
