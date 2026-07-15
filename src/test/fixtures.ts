import type { Order, Page } from '../types';

export const deliveredOrder: Order = {
  id: 'o_1',
  orderNumber: 'SP-1001',
  placedAt: '2026-06-03',
  status: 'delivered',
  items: [
    { id: 'i_lamp', name: 'Desk Lamp', unitPriceCents: 5800, quantity: 1, returnEligible: true },
    { id: 'i_mug', name: 'Stone Mug', unitPriceCents: 1250, quantity: 3, returnEligible: true },
    { id: 'i_soil', name: 'Potting Mix', unitPriceCents: 1800, quantity: 1, returnEligible: false },
  ],
};

export const shippedOrder: Order = {
  id: 'o_2',
  orderNumber: 'SP-1002',
  placedAt: '2026-06-09',
  status: 'shipped',
  items: [{ id: 'i_jacket', name: 'Rain Jacket', unitPriceCents: 15800, quantity: 1, returnEligible: true }],
};

export function pageOf(data: Order[], total = data.length, page = 1, pageSize = 4): Page<Order> {
  return { data, total, page, pageSize };
}
