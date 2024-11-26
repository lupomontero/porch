import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json'};

export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'node:stream',
        replacement: resolve(__dirname, 'lib/stream-polyfill.js'),
      },
    ],
  },
  build: {
    target: 'es2015',
    lib: {
      entry: resolve(__dirname, 'index.js'),
      name: pkg.name,
      formats: ['es', 'cjs', 'umd'],
      fileName: format => (
        format === 'umd'
          ? `${pkg.name}.umd.cjs`
          : format === 'cjs'
            ? `${pkg.name}.cjs`
            : `${pkg.name}.mjs`
      ),
    },
  },
});
