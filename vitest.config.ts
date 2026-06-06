import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const srcDir = `${fileURLToPath(new URL('./src/', import.meta.url)).replace(/\\/g, '/')}`;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${srcDir}`,
      },
    ],
  },
  test: {
    alias: {
      '@': srcDir.replace(/\/$/, ''),
      '@/': srcDir,
    },
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.stories.*',
        '**/__mocks__/**',
        'src/**/*.config.{ts,tsx}',
        'src/**/index.{ts,tsx}',
        'src/app/globals.css',
        'src/assets/**',
        'src/styles/**',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
          setupFiles: ['tests/setup/setup-vitest.node.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          exclude: ['tests/integration/db/**/*.test.ts'],
          setupFiles: ['tests/setup/setup-vitest.node.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'db',
          environment: 'node',
          include: ['tests/integration/db/**/*.test.ts'],
          setupFiles: ['tests/setup/setup-vitest.node.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'contract',
          environment: 'node',
          include: ['tests/contract/**/*.test.ts'],
          setupFiles: ['tests/setup/setup-vitest.node.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['tests/component/**/*.test.ts', 'tests/component/**/*.test.tsx'],
          setupFiles: ['tests/setup/setup-vitest.dom.ts'],
        },
      },
    ],
  },
});
