/**
 * L1 — Raw Radii Tokens (primitives)
 *
 * Border radius scale. Intentionally different from Chakra defaults —
 * uses a softer progression based on the legacy Reviews app.
 *
 * Components use semantic radii:
 *   radii.control → inputs, buttons
 *   radii.card    → cards, panels
 *   radii.modal   → modals, drawers
 *   radii.pill    → badges, tags
 *
 * To change overall visual character: update semantic radii in semanticTokens/layout.ts.
 */

export const radiiTokens = {
  radii: {
    none: { value: '0' },
    xs: { value: '0.125rem' }, //  2px
    sm: { value: '0.25rem' }, //  4px
    md: { value: '0.375rem' }, //  6px
    lg: { value: '0.5rem' }, //  8px
    xl: { value: '0.75rem' }, // 12px
    '2xl': { value: '1rem' }, // 16px
    '3xl': { value: '1.5rem' }, // 24px
    full: { value: '9999px' },
  },
} as const;
