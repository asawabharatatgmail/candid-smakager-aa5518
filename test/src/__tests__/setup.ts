import '@testing-library/jest-dom';

// Provide a minimal localStorage in jsdom
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

// Reset localStorage between tests so state doesn't leak
beforeEach(() => localStorage.clear());
