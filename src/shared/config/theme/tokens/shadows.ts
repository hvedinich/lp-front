/**
 * L1 — Raw Shadow Tokens (primitives)
 *
 * Shadow scale for the elevation system.
 * Components use semantic shadow roles from semanticTokens/elevation.ts:
 *   shadow.card     → shadow.sm
 *   shadow.modal    → shadow.lg
 *   shadow.dropdown → shadow.md
 *
 * To change overall UI depth: update semantic shadows in elevation.ts.
 */

export const shadowTokens = {
  shadows: {
    none: { value: 'none' },
    xs: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    sm: { value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)' },
    md: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' },
    lg: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' },
    xl: { value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' },
    '2xl': { value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    /**
     * card — subtle drop-shadow for cards.
     * No hardcoded color — works correctly on any canvas background.
     */
    card: { value: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)' },
    inner: { value: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' },
  },
} as const;
