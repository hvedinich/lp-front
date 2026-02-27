/**
 * L1 — Raw Border Width Tokens
 *
 * Named tokens for border widths — avoids escape-hatch '[1px]' syntax.
 * Components use semantic border width names, not raw CSS values.
 *
 * Usage:
 *   borderWidth='thin'    // 1px  ← standard borders
 *   borderWidth='medium'  // 2px  ← focus rings, emphasis
 */

export const borderWidthTokens = {
  borderWidths: {
    none: { value: '0' },
    thin: { value: '1px' },
    medium: { value: '2px' },
  },
} as const;
