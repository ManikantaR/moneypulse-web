import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from '@/components/transactions/filter-bar';

vi.mock('@/lib/firebase', () => ({
  firebaseAuth: vi.fn(() => ({})),
  firebaseDb: vi.fn(() => ({})),
}));

describe('FilterBar', () => {
  it('renders all preset chips', () => {
    render(<FilterBar onFilterChange={vi.fn()} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
    expect(screen.getByText('Last month')).toBeInTheDocument();
  });

  it('marks the active preset with aria-pressed=true', () => {
    render(<FilterBar activePreset="income" onFilterChange={vi.fn()} />);
    expect(screen.getByText('Income').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('All').closest('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onFilterChange with empty filters for "all" preset', () => {
    const onChange = vi.fn();
    render(<FilterBar onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('All'));
    expect(onChange).toHaveBeenCalledWith({}, 'all');
  });

  it('calls onFilterChange with isCredit:true for income preset', () => {
    const onChange = vi.fn();
    render(<FilterBar onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('Income'));
    expect(onChange).toHaveBeenCalledWith({ isCredit: true }, 'income');
  });

  it('calls onFilterChange with isCredit:false for expenses preset', () => {
    const onChange = vi.fn();
    render(<FilterBar onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('Expenses'));
    expect(onChange).toHaveBeenCalledWith({ isCredit: false }, 'expenses');
  });

  it('calls onFilterChange with date range for this-month preset', () => {
    const onChange = vi.fn();
    render(<FilterBar onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('This month'));
    const [filters, preset] = onChange.mock.calls[0];
    expect(preset).toBe('this-month');
    expect(filters.startDate).toMatch(/^\d{4}-\d{2}-01$/);
    expect(filters.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('calls onFilterChange with date range for last-month preset', () => {
    const onChange = vi.fn();
    render(<FilterBar onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('Last month'));
    const [filters, preset] = onChange.mock.calls[0];
    expect(preset).toBe('last-month');
    expect(filters.startDate).toMatch(/^\d{4}-\d{2}-01$/);
  });
});
