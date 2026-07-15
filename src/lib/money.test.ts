import { describe, it, expect } from 'vitest';
import {
  formatMoney,
  lineTotalCents,
  orderTotalCents,
  returnedValueCents,
  resolutionAmountCents,
  storeCreditBonusCents,
} from './money';
import type { Order, OrderItem } from '../types';

describe('lib/money', () => {
  describe('formatMoney', () => {
    it('formats cents as USD currency', () => {
      expect(formatMoney(0)).toBe('$0.00');
      expect(formatMoney(1)).toBe('$0.01');
      expect(formatMoney(100)).toBe('$1.00');
      expect(formatMoney(14200)).toBe('$142.00');
      expect(formatMoney(999999)).toBe('$9,999.99');
    });
  });

  describe('lineTotalCents', () => {
    it('multiplies unit price by quantity', () => {
      expect(lineTotalCents(100, 1)).toBe(100);
      expect(lineTotalCents(100, 2)).toBe(200);
      expect(lineTotalCents(14200, 1)).toBe(14200);
      expect(lineTotalCents(5050, 3)).toBe(15150);
    });

    it('handles zero quantity', () => {
      expect(lineTotalCents(100, 0)).toBe(0);
    });
  });

  describe('orderTotalCents', () => {
    it('sums all line totals', () => {
      const order: Order = {
        id: 'o_123',
        orderNumber: 'SP-123',
        placedAt: '2026-07-21',
        status: 'delivered',
        items: [
          {
            id: 'i_1',
            name: 'Item 1',
            unitPriceCents: 100,
            quantity: 2,
            returnEligible: true,
          },
          {
            id: 'i_2',
            name: 'Item 2',
            unitPriceCents: 300,
            quantity: 1,
            returnEligible: true,
          },
        ],
      };

      expect(orderTotalCents(order)).toBe(500); // 100*2 + 300*1
    });

    it('returns 0 for empty orders', () => {
      const order: Order = {
        id: 'o_empty',
        orderNumber: 'SP-EMPTY',
        placedAt: '2026-07-21',
        status: 'delivered',
        items: [],
      };

      expect(orderTotalCents(order)).toBe(0);
    });
  });

  describe('returnedValueCents', () => {
    const items: OrderItem[] = [
      {
        id: 'i_1',
        name: 'Item 1',
        unitPriceCents: 1000,
        quantity: 2,
        returnEligible: true,
      },
      {
        id: 'i_2',
        name: 'Item 2',
        unitPriceCents: 5000,
        quantity: 1,
        returnEligible: true,
      },
      {
        id: 'i_3',
        name: 'Item 3',
        unitPriceCents: 2000,
        quantity: 1,
        returnEligible: false,
      },
    ];

    it('sums the returned items', () => {
      const selections = { i_1: 1, i_2: 1 };
      expect(returnedValueCents(items, selections)).toBe(6000); // 1000*1 + 5000*1
    });

    it('ignores unselected items', () => {
      const selections = { i_1: 2 };
      expect(returnedValueCents(items, selections)).toBe(2000); // 1000*2
    });

    it('handles zero quantities', () => {
      const selections = { i_1: 0, i_2: 0 };
      expect(returnedValueCents(items, selections)).toBe(0);
    });

    it('ignores non-existent item ids', () => {
      const selections = { nonexistent: 5 };
      expect(returnedValueCents(items, selections)).toBe(0);
    });

    it('returns 0 for empty selections', () => {
      expect(returnedValueCents(items, {})).toBe(0);
    });
  });

  describe('resolutionAmountCents', () => {
    it('returns the value for refund', () => {
      expect(resolutionAmountCents(10000, 'refund')).toBe(10000);
      expect(resolutionAmountCents(1, 'refund')).toBe(1);
    });

    it('returns the value for exchange', () => {
      expect(resolutionAmountCents(10000, 'exchange')).toBe(10000);
    });

    it('adds 10% bonus for store_credit', () => {
      expect(resolutionAmountCents(10000, 'store_credit')).toBe(11000); // 10000 * 1.10
      expect(resolutionAmountCents(100, 'store_credit')).toBe(110);
    });

    it('rounds store_credit bonus correctly', () => {
      // 10003 * 1.10 = 11003.3 -> rounds to 11003
      expect(resolutionAmountCents(10003, 'store_credit')).toBe(11003);
      // 10005 * 1.10 = 11005.5 -> rounds to 11006 (banker's rounding)
      expect(resolutionAmountCents(10005, 'store_credit')).toBe(11006);
    });

    it('handles zero value', () => {
      expect(resolutionAmountCents(0, 'refund')).toBe(0);
      expect(resolutionAmountCents(0, 'store_credit')).toBe(0);
    });
  });

  describe('storeCreditBonusCents', () => {
    it('returns 0 for refund', () => {
      expect(storeCreditBonusCents(10000, 'refund')).toBe(0);
    });

    it('returns 0 for exchange', () => {
      expect(storeCreditBonusCents(10000, 'exchange')).toBe(0);
    });

    it('returns the 10% bonus for store_credit', () => {
      expect(storeCreditBonusCents(10000, 'store_credit')).toBe(1000); // 10% of 10000
      expect(storeCreditBonusCents(100, 'store_credit')).toBe(10);
    });

    it('handles rounding edge cases', () => {
      // When value*1.10 rounds, the bonus is the difference
      const value = 10003;
      const bonus = storeCreditBonusCents(value, 'store_credit');
      const total = resolutionAmountCents(value, 'store_credit');
      expect(total - value).toBe(bonus); // Bonus + value should equal total
    });

    it('returns 0 for zero value', () => {
      expect(storeCreditBonusCents(0, 'store_credit')).toBe(0);
    });
  });

  describe('integration: return flow totals', () => {
    const order: Order = {
      id: 'o_test',
      orderNumber: 'SP-TEST',
      placedAt: '2026-07-21',
      status: 'delivered',
      items: [
        {
          id: 'i_headphones',
          name: 'Headphones',
          unitPriceCents: 14200,
          quantity: 1,
          returnEligible: true,
        },
        {
          id: 'i_case',
          name: 'Case',
          unitPriceCents: 4200,
          quantity: 1,
          returnEligible: true,
        },
        {
          id: 'i_warranty',
          name: 'Warranty (non-returnable)',
          unitPriceCents: 2000,
          quantity: 1,
          returnEligible: false,
        },
      ],
    };

    it('computes correct amounts for a complete return', () => {
      const returnableItems = order.items.filter((item) => item.returnEligible);
      const selections = { i_headphones: 1, i_case: 1 };

      const returnedValue = returnedValueCents(returnableItems, selections);
      expect(returnedValue).toBe(18400); // 142 + 42 dollars

      expect(resolutionAmountCents(returnedValue, 'refund')).toBe(18400);
      expect(resolutionAmountCents(returnedValue, 'exchange')).toBe(18400);
      expect(resolutionAmountCents(returnedValue, 'store_credit')).toBe(20240); // 18400 * 1.10
      expect(storeCreditBonusCents(returnedValue, 'store_credit')).toBe(1840);
    });

    it('computes correct amounts for a partial return', () => {
      const returnableItems = order.items.filter((item) => item.returnEligible);
      const selections = { i_headphones: 1 }; // Just the headphones

      const returnedValue = returnedValueCents(returnableItems, selections);
      expect(returnedValue).toBe(14200);

      expect(resolutionAmountCents(returnedValue, 'refund')).toBe(14200);
      expect(resolutionAmountCents(returnedValue, 'store_credit')).toBe(15620); // 14200 * 1.10
    });
  });
});
