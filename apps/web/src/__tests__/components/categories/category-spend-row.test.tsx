import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategorySpendRow } from '@/components/categories/category-spend-row';
import type { CategoryDoc } from '@/lib/types/firestore';

vi.mock('@/lib/firebase', () => ({
  firebaseDb: vi.fn(() => ({})),
  firebaseAuth: vi.fn(() => ({})),
}));

const cat: CategoryDoc = {
  id: 'doc-1',
  categoryId: 'cat-groceries',
  name: 'Groceries',
  icon: '🛒',
  color: '#4ade80',
  parentCategoryId: null,
  userAliasId: 'user-alias-1',
};

describe('CategorySpendRow', () => {
  it('renders category name with icon', () => {
    render(<CategorySpendRow category={cat} spentCents={15000} budgetCents={null} maxCents={15000} />);
    expect(screen.getByText('🛒 Groceries')).toBeInTheDocument();
  });

  it('renders formatted spend amount', () => {
    render(<CategorySpendRow category={cat} spentCents={15000} budgetCents={null} maxCents={15000} />);
    expect(screen.getByText('$150')).toBeInTheDocument();
  });

  it('renders progress bar at 100% when spent equals max', () => {
    render(<CategorySpendRow category={cat} spentCents={15000} budgetCents={null} maxCents={15000} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle({ width: '100%' });
  });

  it('renders progress bar at 50% when spent is half of max', () => {
    render(<CategorySpendRow category={cat} spentCents={7500} budgetCents={null} maxCents={15000} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle({ width: '50%' });
  });

  it('renders budget amount when provided', () => {
    render(<CategorySpendRow category={cat} spentCents={8000} budgetCents={20000} maxCents={20000} />);
    expect(screen.getByText('/ $200')).toBeInTheDocument();
  });

  it('shows over-budget style when spent exceeds budget', () => {
    render(<CategorySpendRow category={cat} spentCents={25000} budgetCents={20000} maxCents={25000} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.className).toMatch(/red/);
  });

  it('renders Uncategorized label when category is null', () => {
    render(<CategorySpendRow category={null} spentCents={5000} budgetCents={null} maxCents={10000} />);
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });
});
