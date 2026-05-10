import '@testing-library/jest-dom';
import { vi } from 'vitest';

// React Fast Refresh globals required when @vitejs/plugin-react-oxc is used in jsdom
(globalThis as Record<string, unknown>).$RefreshReg$ = () => {};
(globalThis as Record<string, unknown>).$RefreshSig$ = () => (t: unknown) => t;

// Privacy context — default to unlocked in all tests
vi.mock('@/lib/privacy/privacy-context', () => ({
  usePrivacy: () => ({ isLocked: false, hasPin: false, pinReady: true, isUnlockOpen: false, lock: vi.fn(), openUnlock: vi.fn(), closeUnlock: vi.fn(), unlock: vi.fn(), setPin: vi.fn(), resetPin: vi.fn() }),
  PrivacyProvider: ({ children }: { children: React.ReactNode }) => children,
}));
