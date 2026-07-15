import { fireEvent, screen, within } from '@testing-library/react';
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

const next = () => fireEvent.click(screen.getByRole('button', { name: 'Next' }));
const back = () => fireEvent.click(screen.getByRole('button', { name: 'Back' }));

async function openFlow() {
  renderRoute('/orders/o_1/return');
  await screen.findByRole('heading', { name: 'Return or exchange' });
}

function chooseQuantity(itemName: string, quantity: number) {
  fireEvent.change(screen.getByLabelText(`Return quantity for ${itemName}`), {
    target: { value: String(quantity) },
  });
}

async function completeToReview(resolution: RegExp = /store credit/i) {
  await openFlow();
  chooseQuantity('Desk Lamp', 1);
  chooseQuantity('Stone Mug', 2);
  next();
  fireEvent.change(screen.getByLabelText('Reason for return'), {
    target: { value: 'Not as described' },
  });
  fireEvent.change(screen.getByLabelText('Comments (optional)'), {
    target: { value: '  Colour was off  ' },
  });
  next();
  fireEvent.click(screen.getByRole('radio', { name: resolution }));
  next();
}

beforeEach(() => {
  vi.resetAllMocks();
  api.getOrder.mockResolvedValue(deliveredOrder);
});

describe('ReturnFlowPage — item step', () => {
  it('blocks Next until an item is chosen, and lets several items be picked', async () => {
    await openFlow();

    expect(screen.getByText('Step 1 of 4: Items')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByText('Choose at least one item to continue.')).toBeInTheDocument();

    chooseQuantity('Desk Lamp', 1);
    chooseQuantity('Stone Mug', 3);

    // Still on the item step: choosing a quantity does not auto-advance.
    expect(screen.getByText('Step 1 of 4: Items')).toBeInTheDocument();
    expect(screen.getByText('4 items selected')).toBeInTheDocument();
    expect(screen.getByText('$95.50')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('caps quantities at the ordered amount and disables non-returnable lines', async () => {
    await openFlow();

    const mugOptions = within(screen.getByLabelText('Return quantity for Stone Mug')).getAllByRole('option');
    expect(mugOptions.map((o) => o.textContent)).toEqual(['Return none', 'Return 1', 'Return 2', 'Return 3']);
    expect(screen.queryByLabelText('Return quantity for Potting Mix')).not.toBeInTheDocument();
    expect(screen.getByText('Not returnable')).toBeInTheDocument();
  });
});

describe('ReturnFlowPage — navigation', () => {
  it('requires a reason before the resolution step', async () => {
    await openFlow();
    chooseQuantity('Desk Lamp', 1);
    next();

    expect(screen.getByText('Step 2 of 4: Reason')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Reason for return'), { target: { value: 'Wrong item sent' } });
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('keeps earlier answers when going back', async () => {
    await completeToReview();
    back();
    expect(screen.getByRole('radio', { name: /store credit/i })).toBeChecked();
    back();
    expect(screen.getByLabelText('Reason for return')).toHaveValue('Not as described');
    back();
    expect(screen.getByLabelText('Return quantity for Stone Mug')).toHaveValue('2');
  });
});

describe('ReturnFlowPage — resolution and review', () => {
  it('shows each resolution amount, with the 10% store-credit bonus', async () => {
    await openFlow();
    chooseQuantity('Desk Lamp', 1);
    chooseQuantity('Stone Mug', 2);
    next();
    fireEvent.change(screen.getByLabelText('Reason for return'), { target: { value: 'Wrong item sent' } });
    next();

    // $58.00 + 2 × $12.50 = $83.00; store credit adds $8.30.
    expect(within(screen.getByRole('radio', { name: /refund/i }).closest('label')!).getByText('$83.00')).toBeInTheDocument();
    const credit = screen.getByRole('radio', { name: /store credit/i }).closest('label')!;
    expect(within(credit).getByText('$91.30')).toBeInTheDocument();
    expect(within(credit).getByText('(+$8.30 bonus)')).toBeInTheDocument();
  });

  it('summarises the request on the review step', async () => {
    await completeToReview();

    expect(screen.getByText('Step 4 of 4: Review')).toBeInTheDocument();
    expect(screen.getByText('Desk Lamp')).toBeInTheDocument();
    expect(screen.getByText('×2')).toBeInTheDocument();
    expect(screen.getByText('Not as described')).toBeInTheDocument();
    expect(screen.getByText('$91.30')).toBeInTheDocument();
    expect(screen.queryByText('Potting Mix')).not.toBeInTheDocument();
  });
});

describe('ReturnFlowPage — submission', () => {
  it('submits the mapped request and shows the receipt', async () => {
    api.submitReturn.mockResolvedValue({ returnId: 'rma_x1y2z3', createdAt: '2026-06-10T10:00:00Z' });
    await completeToReview();

    fireEvent.click(screen.getByRole('button', { name: 'Submit return' }));

    expect(await screen.findByRole('heading', { name: 'Return submitted' })).toBeInTheDocument();
    expect(screen.getByText('rma_x1y2z3')).toBeInTheDocument();
    expect(api.submitReturn).toHaveBeenCalledTimes(1);
    expect(api.submitReturn.mock.calls[0][0]).toEqual({
      orderId: 'o_1',
      items: [
        { itemId: 'i_lamp', quantity: 1 },
        { itemId: 'i_mug', quantity: 2 },
      ],
      reason: 'Not as described',
      resolution: 'store_credit',
      comment: 'Colour was off',
    });
    for (const link of screen.getAllByRole('link', { name: 'Back to orders' })) {
      expect(link).toHaveAttribute('href', '/');
    }
  });

  it('shows a failure without retrying, then retries only when asked', async () => {
    api.submitReturn
      .mockRejectedValueOnce(new ApiError(500, "We couldn't submit your return. Please try again."))
      .mockResolvedValueOnce({ returnId: 'rma_retry1', createdAt: '2026-06-10T10:00:00Z' });
    await completeToReview(/refund/i);

    fireEvent.click(screen.getByRole('button', { name: 'Submit return' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't submit your return. Please try again.");
    expect(api.submitReturn).toHaveBeenCalledTimes(1);

    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('rma_retry1')).toBeInTheDocument();
    expect(api.submitReturn).toHaveBeenCalledTimes(2);
  });
});

describe('ReturnFlowPage — guards', () => {
  it('refuses orders that have not been delivered', async () => {
    api.getOrder.mockResolvedValue(shippedOrder);
    renderRoute('/orders/o_2/return');

    expect(await screen.findByRole('heading', { name: "Can't start a return" })).toBeInTheDocument();
    expect(screen.getByText('Returns open once an order has been delivered.')).toBeInTheDocument();
  });

  it('shows the load error with a retry instead of an eligibility message', async () => {
    api.getOrder.mockRejectedValueOnce(new ApiError(503, 'Service unavailable.')).mockResolvedValue(deliveredOrder);
    renderRoute('/orders/o_1/return');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't load that order");
    expect(alert).toHaveTextContent('Service unavailable.');

    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Return or exchange' })).toBeInTheDocument();
  });
});
