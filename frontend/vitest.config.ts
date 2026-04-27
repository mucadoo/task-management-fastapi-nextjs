import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [
        'src/test/**',
        'src/types/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.d.ts',
        'src/lib/api.ts',
      ],
      thresholds: {
        lines: 9,
        functions: 7,
        branches: 15,
        statements: 9,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
