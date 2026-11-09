import tseslint from 'typescript-eslint';

// Lint previously had no config. Rules the existing code already violates are
// warnings so lint can run as a gate; tighten them in a follow-up.
export default tseslint.config(...tseslint.configs.recommended, {
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  ignores: ['lib/**', 'node_modules/**'],
});
