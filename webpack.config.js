import path from 'node:path';

const dirname = path.dirname(import.meta.url);

export default {
  entry: './index.js',
  output: {
    path: path.join(dirname, 'dist').slice(5),
    filename: 'porch-browser.min.js',
  },
  resolve: {
    fallback: {
      stream: path.join(dirname, 'lib/stream-polyfill.js').slice(5),
    },
  },
};
