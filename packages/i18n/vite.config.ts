import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';
import { fileURLToPath } from 'node:url';
import { slopkitI18n } from './src/vite';

const runtime = fileURLToPath(new URL('./src/runtime/index.ts', import.meta.url));

// The package ships uncompiled Solid source (see `build:source`); this config only serves the tests.
// Budget files run alone, after the unit project.
export default defineConfig({
  test: {
    projects: [
      {
        // The LLM references and skills: no DOM, no Solid.
        test: { name: 'docs', environment: 'node', include: ['test/**/*.test.ts'] },
      },
      {
        // The compiler and the message formatter: Node only, no Solid.
        test: {
          name: 'compile',
          environment: 'node',
          include: [
            'src/compile/**/*.test.ts',
            'src/message/**/*.test.ts',
            'src/vite.test.ts',
            'src/vite.build.test.ts',
            'src/cli.test.ts',
          ],
          // The TypeScript tests run `tsc` on a temporary project, which takes several seconds on a busy CI runner.
          testTimeout: 30_000,
        },
      },
      {
        // The end-to-end test imports a translation file, so the unit project runs the plugin too (the way an app's tests would).
        plugins: [solid({ ssr: true }), slopkitI18n({ locales: ['en', 'de'], defaultLocale: 'en' })],
        resolve: { alias: { '@solid-slopkit/i18n': runtime } },
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/runtime/**/*.test.{ts,tsx}'],
          exclude: ['**/*.ssr.test.*', '**/*.budget.test.*'],
          setupFiles: ['./test/setup.ts'],
        },
      },
      {
        plugins: [solid({ ssr: true })],
        test: { name: 'ssr', environment: 'node', include: ['src/runtime/**/*.ssr.test.{ts,tsx}'] },
      },
      {
        plugins: [solid({ ssr: true })],
        test: {
          name: 'budget',
          environment: 'jsdom',
          include: ['src/runtime/**/*.budget.test.{ts,tsx}'],
          setupFiles: ['./test/setup.ts'],
          fileParallelism: false,
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
});
