import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KpiCard } from '@/components/dashboard/kpi-card';

vi.mock('@/lib/firebase', () => ({
  firebaseDb: vi.fn(() => ({})),
  firebaseAuth: vi.fn(() => ({})),
}));


describe('KpiCard', () => {
  it('renders the label', () => {
    render(<KpiCard label="Total Income" amountCents={150000} variant="income" />);
    expect(screen.getByText('Total Income')).toBeInTheDocument();
  });

  it('formats amountCents as USD currency', () => {
    render(<KpiCard label="Income" amountCents={150000} variant="income" />);
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<KpiCard label="Income" amountCents={0} variant="income" isLoading />);
    expect(screen.getByRole('generic', { name: 'loading' })).toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });

  it('applies income variant (green) class', () => {
    render(<KpiCard label="Income" amountCents={5000} variant="income" />);
    const el = screen.getByText('$50.00');
    expect(el).toHaveAttribute('data-variant', 'income');
    expect(el.className).toMatch(/green/);
  });

  it('applies expense variant (destructive) class', () => {
    render(<KpiCard label="Expenses" amountCents={3000} variant="expense" />);
    const el = screen.getByText('$30.00');
    expect(el).toHaveAttribute('data-variant', 'expense');
    expect(el.className).toMatch(/destructive/);
  });

  it('applies cashflow variant (primary) class', () => {
    render(<KpiCard label="Cash Flow" amountCents={2000} variant="cashflow" />);
    const el = screen.getByText('$20.00');
    expect(el).toHaveAttribute('data-variant', 'cashflow');
    expect(el.className).toMatch(/primary/);
  });

  it('handles zero cents', () => {
    render(<KpiCard label="Income" amountCents={0} variant="income" />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles negative cash flow', () => {
    render(<KpiCard label="Cash Flow" amountCents={-50000} variant="cashflow" />);
    expect(screen.getByText('-$500.00')).toBeInTheDocument();
  });
});
