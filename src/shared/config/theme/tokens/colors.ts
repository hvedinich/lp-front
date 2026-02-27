/**
 * L1 — Raw Color Tokens (primitives)
 *
 * Rules:
 * ❌ No semantic names — banned: brand.pure, brand.light, secondary, delete
 * ✅ Numeric scales only: brand.500, gray.200, error.50
 * ❌ Forbidden in components — use semanticTokens only
 *
 * Anti-patterns intentionally avoided (legacy Reviews codebase):
 * - secondary === gray (two aliases for the same palette)
 * - delete === error (different names for the same semantic role)
 * - error.pure / error.light (mixing L1 and L2 in the same file)
 */

export const colorTokens = {
  /**
   * brand — primary brand red.
   * Used via semantic tokens: fg.brand, bg.brand, border.brand.
   */
  brand: {
    50: { value: '#FFF5F5' },
    100: { value: '#FED7D7' },
    200: { value: '#FEB2B2' },
    300: { value: '#FC8181' },
    400: { value: '#F56565' },
    500: { value: '#E53E3E' },
    600: { value: '#C53030' },
    700: { value: '#9B2C2C' },
    800: { value: '#822727' },
    900: { value: '#63171B' },
  },

  /**
   * gray — cool neutral (custom scale, differs from Chakra default).
   * Used via semantic tokens: fg.*, bg.*, border.*.
   * No 'secondary' alias — intentional.
   */
  gray: {
    50: { value: '#F7FAFC' },
    100: { value: '#EDF2F7' },
    200: { value: '#E2E8F0' },
    300: { value: '#CBD5E0' },
    400: { value: '#A0AEC0' },
    500: { value: '#718096' },
    600: { value: '#4A5568' },
    700: { value: '#2D3748' },
    800: { value: '#1A202C' },
    900: { value: '#171923' },
  },

  /**
   * error — separate scale for errors and destructive actions.
   * No 'delete' group — same semantic role, one token.
   * Used via: fg.error, bg.error, border.error.
   */
  error: {
    50: { value: '#FFF5F5' },
    100: { value: '#FED7D7' },
    200: { value: '#FEB2B2' },
    300: { value: '#FC8181' },
    400: { value: '#F56565' },
    500: { value: '#C11A1A' },
    600: { value: '#9B1515' },
    700: { value: '#7A1010' },
    800: { value: '#5A0A0A' },
    900: { value: '#3D0505' },
  },

  /**
   * success — green for positive states.
   * Used via: fg.success, bg.success.
   */
  success: {
    50: { value: '#F0FFF4' },
    100: { value: '#C6F6D5' },
    200: { value: '#9AE6B4' },
    300: { value: '#68D391' },
    400: { value: '#48BB78' },
    500: { value: '#38A169' },
    600: { value: '#2F855A' },
    700: { value: '#276749' },
    800: { value: '#22543D' },
    900: { value: '#1C4532' },
  },

  /**
   * warning — orange for warnings.
   * Used via: fg.warning, bg.warning.
   */
  warning: {
    50: { value: '#FFFAF0' },
    100: { value: '#FEEBC8' },
    200: { value: '#FBD38D' },
    300: { value: '#F6AD55' },
    400: { value: '#ED8936' },
    500: { value: '#DD6B20' },
    600: { value: '#C05621' },
    700: { value: '#9C4221' },
    800: { value: '#7B341E' },
    900: { value: '#652B19' },
  },

  /**
   * accent — violet accent scale for focus rings, selected states, decorative details.
   * Base hue: #7B61FF (SnowUI violet).
   * Used via semantic tokens: fg.accent, bg.accent, border.focusRing, border.accent.
   * NOT the primary action color — brand (red) remains the brand color.
   */
  accent: {
    50: { value: '#F5F3FF' },
    100: { value: '#EDE9FE' },
    200: { value: '#DDD6FE' },
    300: { value: '#C4B5FD' },
    400: { value: '#A78BFA' },
    500: { value: '#7B61FF' },
    600: { value: '#6D35EE' },
    700: { value: '#5B21D6' },
    800: { value: '#4A1AB8' },
    900: { value: '#3C1499' },
  },
} as const;

/**
 * Rating color constants — used directly in semantic tokens.
 * Not a full palette scale, so not placed in the L1 tokens object.
 * Referenced only from semanticTokens/colors.ts.
 */
export const ratingColors = {
  /** Active star fill — amber yellow */
  active: '#f0c400',
  /** Inactive star fill — muted blue-gray */
  inactive: '#b1c8dd',
  /** Inactive star in dark mode */
  inactiveDark: '#4a6d8c',
} as const;
