import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as services from '../../services';
import { ApiError } from '../../services';
import { deliveredOrder, shippedOrder } from '../../test/fixtures';
import { renderRoute } from '../../test/render';

vi.mock('../../services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services')>()),
  listOrders: vi.fn(),
  getOrder: vi.fn(),
  submitReturn: vi.fn(),
}));

const api = vi.mocked(services);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('OrderDetailPage', () => {
  it('shows line items, the total and a return link for delivered orders', async () => {
    api.getOrder.mockResolvedValue(deliveredOrder);
    renderRoute('/orders/o_1');

    expect(await screen.findByRole('heading', { name: 'SP-1001' })).toBeInTheDocument();
    expect(api.getOrder).toHaveBeenCalledWith('o_1', expect.any(AbortSignal));
    expect(screen.getByText('$37.50')).toBeInTheDocument();
    expect(screen.getByText('$113.50')).toBeInTheDocument();
    expect(screen.getByText(/Not returnable/)).toBeInTheDocument();

    const returnLink = screen.getByRole('link', { name: /return or exchange/i });
    expect(returnLink).toHaveAttribute('href', '/orders/o_1/return');
    expect(returnLink.closest('button')).toBeNull();
  });

  it('explains why undelivered orders cannot be returned', async () => {
    api.getOrder.mockResolvedValue(shippedOrder);
    renderRoute('/orders/o_2');

    expect(await screen.findByText('Returns open once an order has been delivered.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /return or exchange/i })).not.toBeInTheDocument();
  });

  it('shows a not-found error', async () => {
    api.getOrder.mockRejectedValue(new ApiError(404, "We couldn't find that order."));
    renderRoute('/orders/o_missing');

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't find that order.");
  });
});
