import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// Lint was previously non-functional (`next lint` was removed in Next 16 and
// there was no config). Rules the existing code already violates are reported
// as warnings so lint can run as a gate; tighten them in a follow-up.
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default config;
