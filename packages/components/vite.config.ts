import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';
import { playwright } from '@vitest/browser-playwright';

// The package ships uncompiled Solid source (see `build:source`); consumers compile it with
// their own Vite. This config only serves local tooling such as tests.
export default defineConfig({
  plugins: [solid({ ssr: true })],
  test: {
    globals: false,
    projects: [
      {
        // Logic, ARIA and reactivity: fast, no layout.
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
          setupFiles: ['./vitest-setup.ts', './vitest-jsdom-setup.ts'],
          // An SSR test's first render starts the helper's own Vite server (test/ssr.tsx), once per test file.
          testTimeout: 20_000,
        },
      },
      {
        // Anything that needs a real browser: layout, focus, the top layer, positioning, real key events.
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          setupFiles: ['./vitest-setup.ts', './vitest-browser-setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
