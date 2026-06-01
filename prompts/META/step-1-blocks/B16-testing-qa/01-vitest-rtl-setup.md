# 01-vitest-rtl-setup.md

> **Superseded-By (bootstrap):** `06-tests-foundation-init-pr.md` — use this file for additional RTL component tests after step 06 lands.

## Title

Vitest + React Testing Library — setup

## Objective

Configure Vitest for TS/React, add basic RTL utilities, and write first tests.

## Steps

1. Install deps:

- pnpm add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @types/jest

1. Create vitest config and setup files:

- vitest.config.ts
- src/test/setup.ts

1. Add sample tests:

- src/components/ui/**tests**/gold-button.test.tsx

1. Scripts in package.json:

- "test": "vitest run"
- "test:ui": "vitest --ui"
- "test:watch": "vitest"

## Files

### vitest.config.ts

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
```

### src/test/setup.ts

```ts
import '@testing-library/jest-dom';
```

### src/components/ui/**tests**/gold-button.test.tsx

```tsx
import { render, screen } from '@testing-library/react';

import { GoldButton } from '@/components/ui/gold-button';

describe('GoldButton', () => {
  it('renders children', () => {
    render(<GoldButton>Click me</GoldButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});
```

## Acceptance

- pnpm test runs and passes.
- Coverage output appears.
- Tests can import via @/\* alias.
