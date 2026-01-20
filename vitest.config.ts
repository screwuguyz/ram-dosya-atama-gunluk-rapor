import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Ignore all CSS and PostCSS in tests
    {
      name: 'ignore-css-postcss',
      enforce: 'pre',
      load(id) {
        // Ignore all CSS files
        if (id.endsWith('.css') || id.endsWith('.scss')) {
          return 'export default {}';
        }
      },
    },
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/vitest-setup.ts', './tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/types/**',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  // Completely disable CSS and PostCSS processing in tests
  css: {
    postcss: {
      // Return empty config to prevent PostCSS from loading
      plugins: [],
    },
  },
  // Override Vite's PostCSS config loading
  esbuild: {
    loader: 'tsx',
  },
});
