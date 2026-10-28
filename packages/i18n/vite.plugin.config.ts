import { defineConfig } from 'vite';

// The plugin runs in Node, inside the user's Vite config: one bundled ES module.
export default defineConfig({
  build: {
    target: 'node20',
    outDir: 'dist',
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
    ssr: true,
    lib: { entry: { vite: 'src/vite.ts', cli: 'src/cli.bin.ts' }, formats: ['es'] },
    rollupOptions: {
      external: [/^node:/, 'vite'],
      output: { entryFileNames: '[name].js', banner: (chunk) => (chunk.name === 'cli' ? '#!/usr/bin/env node' : '') },
    },
  },
});
