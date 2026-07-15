import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { ErrorState } from './ErrorState';
import { Stepper } from './Stepper';
import { EmptyState } from './EmptyState';
import { StatusBadge } from '../features/orders';

describe('Button', () => {
  it('defaults to type="button" and fires clicks', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled and busy while loading', () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});

describe('ErrorState', () => {
  it('announces the error and offers a retry', () => {
    const onRetry = vi.fn();
    render(<ErrorState title="Nope" error={new Error('Server said no')} onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Server said no');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('omits the retry button when there is nothing to retry', () => {
    render(<ErrorState error={new Error('x')} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('Stepper', () => {
  const steps = [
    { key: 'a', label: 'Items' },
    { key: 'b', label: 'Reason' },
    { key: 'c', label: 'Review' },
  ];

  it('marks only the current step with aria-current', () => {
    const { container } = render(<Stepper steps={steps} currentIndex={1} />);
    const current = container.querySelectorAll('[aria-current="step"]');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('2');
    expect(screen.getByRole('list', { name: 'Return progress' })).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders the title, description and action', () => {
    render(<EmptyState title="Nothing here" description="Try later" action={<button>Act</button>} />);
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByText('Try later')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('uses shopper-facing labels', () => {
    render(<StatusBadge status="shipped" />);
    expect(screen.getByText('In transit')).toBeInTheDocument();
  });
});
