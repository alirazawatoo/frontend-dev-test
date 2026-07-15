import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as services from '../../services';
import { ApiError } from '../../services';
import { deliveredOrder, pageOf, shippedOrder } from '../../test/fixtures';
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

describe('OrdersPage', () => {
  it('lists orders with number, date, item count, total and status', async () => {
    api.listOrders.mockResolvedValue(pageOf([deliveredOrder, shippedOrder]));
    renderRoute('/');

    const card = (await screen.findByText('SP-1001')).closest('a')!;
    expect(card).toHaveAttribute('href', '/orders/o_1');
    expect(within(card).getByText('Placed 3 Jun 2026 · 5 items')).toBeInTheDocument();
    expect(within(card).getByText('$113.50')).toBeInTheDocument();
    expect(within(card).getByText('Delivered')).toBeInTheDocument();
    expect(within(screen.getByText('SP-1002').closest('a')!).getByText('In transit')).toBeInTheDocument();
    expect(screen.getByText('2 orders')).toBeInTheDocument();
  });

  it('filters by status and goes back to page 1', async () => {
    api.listOrders.mockResolvedValue(pageOf([deliveredOrder], 9));
    renderRoute('/');

    fireEvent.click(await screen.findByRole('button', { name: /next/i }));
    await waitFor(() => expect(api.listOrders).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));

    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'delivered' } });
    await waitFor(() =>
      expect(api.listOrders).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, status: 'delivered' }),
      ),
    );
    expect(api.listOrders).not.toHaveBeenCalledWith(expect.objectContaining({ page: 2, status: 'delivered' }));
  });

  it('debounces the search box before querying', async () => {
    api.listOrders.mockResolvedValue(pageOf([deliveredOrder]));
    renderRoute('/');
    await screen.findByText('SP-1001');

    fireEvent.change(screen.getByLabelText('Search orders'), { target: { value: 'lamp' } });
    expect(api.listOrders).not.toHaveBeenCalledWith(expect.objectContaining({ query: 'lamp' }));
    await waitFor(() =>
      expect(api.listOrders).toHaveBeenLastCalledWith(expect.objectContaining({ query: 'lamp' })),
    );
  });

  it('shows pagination only when there is more than one page', async () => {
    api.listOrders.mockResolvedValue(pageOf([deliveredOrder], 9));
    renderRoute('/');

    const pager = await screen.findByRole('navigation', { name: 'Pagination' });
    expect(within(pager).getByText(/of 3/)).toBeInTheDocument();
    expect(within(pager).getByRole('button', { name: /previous/i })).toBeDisabled();
  });

  it('offers to clear filters when a search matches nothing', async () => {
    api.listOrders.mockImplementation(async (params) =>
      params?.query ? pageOf([]) : pageOf([deliveredOrder]),
    );
    renderRoute('/');
    await screen.findByText('SP-1001');

    fireEvent.change(screen.getByLabelText('Search orders'), { target: { value: 'zzz' } });
    expect(await screen.findByRole('heading', { name: 'No matching orders' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByText('SP-1001')).toBeInTheDocument();
    expect(screen.getByLabelText('Search orders')).toHaveValue('');
  });

  it('shows an empty state for a shopper with no orders', async () => {
    api.listOrders.mockResolvedValue(pageOf([]));
    renderRoute('/');
    expect(await screen.findByRole('heading', { name: 'No orders yet' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('shows the API error and recovers on retry', async () => {
    api.listOrders
      .mockRejectedValueOnce(new ApiError(503, 'The orders service is temporarily unavailable.'))
      .mockResolvedValue(pageOf([deliveredOrder]));
    renderRoute('/');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The orders service is temporarily unavailable.');

    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('SP-1001')).toBeInTheDocument();
  });
});
