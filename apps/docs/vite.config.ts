import { fileRoutes } from 'filesystem-routing/vite';
import { defaultClientConditions, defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';
import { slopkitI18n } from '../../packages/i18n/src/vite.ts';

// Every @solid-slopkit package has a `@solid-slopkit/source` export condition that points at its src. The dev server
// and the tests resolve through it, so edits to a package show up without a build; the production build leaves it out
// and consumes each package's dist through its exports, like any app.
const source = '@solid-slopkit/source';

export default defineConfig(({ command }) => {
  const fromSource = command === 'serve';
  return {
    // GitHub Pages serves the site under /solid-slopkit/; the deploy workflow sets DOCS_BASE. Dev and tests run at the
    // root.
    base: process.env.DOCS_BASE ?? '/',
    resolve: fromSource ? { conditions: [source, ...defaultClientConditions] } : {},
    ssr: fromSource ? { resolve: { conditions: [source, ...defaultServerConditions] } } : {},
    // Turnkey client mode: no index.html and no mount file — the plugin generates
    // the entries around src/App.tsx (wrapped in src/Document.tsx) and `vite build`
    // prerenders the shell into a purely static dist/client.
    plugins: [
      // Translation files of the i18n examples. From source, so the dev server needs no i18n build.
      slopkitI18n({ locales: ['en', 'de', 'uk'], defaultLocale: 'en' }),
      // `extensions` makes @solidjs/vite-plugin also compile the `?pick=` route
      // modules the fileRoutes plugin emits (their ids end in a query string).
      solid({ start: true, ssr: true, extensions: ['.jsx', '.tsx'], diagnostics: true }),
      fileRoutes({ types: true }),
    ],
    server: {
      port: 3000,
    },
    test: {
      environment: 'jsdom',
      globals: false,
      setupFiles: ['./vitest-setup.ts'],
      passWithNoTests: true,
      // if you have few tests, try commenting this
      // out to improve performance:
      isolate: false,
    },
    build: {
      target: 'esnext',
      assetsInlineLimit: 0,
      rolldownOptions: {
        onwarn(warning, warn) {
          // The Solid plugin appends `export const $$moduleUrl` to every module it compiles for the server, except
          // under node_modules. Here the @solid-slopkit packages are workspace symlinks resolved to packages/*, so their
          // modules get one each and the `export *` index files re-export several. Consumers install them under
          // node_modules and never see this.
          if (warning.code === 'NAMESPACE_CONFLICT' && warning.message.includes('"$$moduleUrl"')) return;
          warn(warning);
        },
      },
    },
  };
});
