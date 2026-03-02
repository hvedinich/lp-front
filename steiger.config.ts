import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,

  // Small project — single-reference slices are expected for now
  { rules: { 'fsd/insignificant-slice': 'off' } },

  // "hooks" is an acceptable shared segment name
  {
    files: ['./src/shared/hooks/**'],
    rules: { 'fsd/segments-by-purpose': 'off' },
  },
]);
