/**
 * L1 — Raw Typography Tokens (primitives)
 *
 * Consumed via semanticTokens/typography.ts (textStyles).
 * Components use textStyle="headingMd" or fontWeight="semibold" —
 * not specific pixel values directly.
 *
 * TODO: when design chooses a custom font — load it via next/font
 * and replace fonts.heading / fonts.body values below.
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 */

export const fontTokens = {
  /**
   * fonts — font families.
   * TODO: replace with a custom font via next/font when design specifies one.
   */
  fonts: {
    heading: { value: 'system-ui, -apple-system, sans-serif' },
    body: { value: 'system-ui, -apple-system, sans-serif' },
    mono: { value: 'ui-monospace, SFMono-Regular, monospace' },
  },

  /**
   * fontSizes — size scale.
   * Matches the scale from the legacy Reviews app (0.75rem base unit).
   */
  fontSizes: {
    '2xs': { value: '0.625rem' }, //  10px
    xs: { value: '0.75rem' }, //  12px
    sm: { value: '0.875rem' }, //  14px
    md: { value: '1rem' }, //  16px
    lg: { value: '1.125rem' }, //  18px
    xl: { value: '1.25rem' }, //  20px
    '2xl': { value: '1.5rem' }, //  24px
    '3xl': { value: '1.875rem' }, //  30px
    '4xl': { value: '2.25rem' }, //  36px
    '5xl': { value: '3rem' }, //  48px
    '6xl': { value: '3.75rem' }, //  60px
  },

  /**
   * fontWeights — weight scale.
   */
  fontWeights: {
    normal: { value: '400' },
    medium: { value: '500' },
    semibold: { value: '600' },
    bold: { value: '700' },
    extrabold: { value: '800' },
  },

  /**
   * lineHeights — line height scale.
   */
  lineHeights: {
    short: { value: '1.2' },
    base: { value: '1.5' },
    tall: { value: '1.8' },
  },

  /**
   * letterSpacings — letter spacing scale.
   * Using Chakra defaults (tight, normal, wider, widest) without changes.
   */
} as const;
