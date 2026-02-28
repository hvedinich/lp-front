import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';

// ── FSD layers (bottom → top) ──────────────────────────────────────
const FSD_LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages'];

// Build the "allow" matrix: each layer may import from itself and layers below
function layerAllowRules() {
  return FSD_LAYERS.map((layer, idx) => ({
    from: [layer],
    allow: FSD_LAYERS.slice(0, idx + 1),
  }));
}

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,

  // ── JSX: no hardcoded strings (i18n enforcement) ─────────────────
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react/jsx-no-literals': ['error', { noStrings: true, ignoreProps: true }],
    },
  },

  // ── FSD boundaries ───────────────────────────────────────────────
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: { boundaries },
    settings: {
      // Resolve @/ alias so the plugin can map imports to elements
      'boundaries/dependency-nodes': ['import', 'dynamic-import'],
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
      // Define FSD elements (one per layer)
      'boundaries/elements': FSD_LAYERS.map((layer) => ({
        type: layer,
        pattern: `src/${layer}/*`,
        capture: ['slice'],
        mode: 'folder',
      })),
      'boundaries/ignore': ['**/*.test.*', '**/*.spec.*'],
    },
    rules: {
      // Layer dependency enforcement: default disallow, then allow downward
      'boundaries/element-types': ['error', { default: 'disallow', rules: layerAllowRules() }],

      // Public API enforcement: cross-slice imports only through index barrel
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: FSD_LAYERS.map((layer) => ({
            target: [layer],
            allow: ['index.ts', 'index.tsx', '**'],
          })),
        },
      ],
    },
  },

  // ── Barrel files: only re-exports, no logic ──────────────────────
  {
    files: ['src/**/index.ts', 'src/**/index.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named re-exports in barrel files, not default exports.',
        },
        {
          selector: 'FunctionDeclaration',
          message: 'No function declarations in barrel files — only re-exports.',
        },
        {
          selector: 'ClassDeclaration',
          message: 'No class declarations in barrel files — only re-exports.',
        },
        {
          selector: 'VariableDeclaration',
          message: 'No variable declarations in barrel files — only re-exports.',
        },
      ],
    },
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
