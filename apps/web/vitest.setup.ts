import '@testing-library/jest-dom';

// React Fast Refresh globals required when @vitejs/plugin-react-oxc is used in jsdom
(globalThis as Record<string, unknown>).$RefreshReg$ = () => {};
(globalThis as Record<string, unknown>).$RefreshSig$ = () => (t: unknown) => t;
