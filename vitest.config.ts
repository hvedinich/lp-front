import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

const config = {
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        baseUrl: '.',
        jsx: 'react-jsx',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        paths: {
          '@/*': ['./src/*'],
        },
        target: 'ES2022',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
};

export default config;
