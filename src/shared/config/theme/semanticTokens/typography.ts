/**
 * Semantic Typography Tokens — textStyles
 *
 * Components use textStyle="headingMd", textStyle="bodySm", etc.
 * Do NOT set fontSize/fontWeight/lineHeight directly.
 *
 * To change UI typography globally: update values here.
 */

export const textStyles = {
  /** Large page heading / hero */
  headingLg: {
    value: {
      fontSize: '4xl',
      fontWeight: 'bold',
      lineHeight: 'short',
      fontFamily: 'heading',
    },
  },
  /** Section heading */
  headingMd: {
    value: {
      fontSize: '2xl',
      fontWeight: 'semibold',
      lineHeight: 'short',
      fontFamily: 'heading',
    },
  },
  /** Card subheading, small title */
  headingSm: {
    value: {
      fontSize: 'xl',
      fontWeight: 'semibold',
      lineHeight: 'short',
      fontFamily: 'heading',
    },
  },
  /** Body text */
  bodyMd: {
    value: {
      fontSize: 'md',
      fontWeight: 'normal',
      lineHeight: 'base',
    },
  },
  /** Helper text, captions */
  bodySm: {
    value: {
      fontSize: 'sm',
      fontWeight: 'normal',
      lineHeight: 'base',
    },
  },
  /** Form labels, menu items */
  label: {
    value: {
      fontSize: 'sm',
      fontWeight: 'medium',
      lineHeight: 'base',
    },
  },
  /** Small labels, timestamps, copyright */
  caption: {
    value: {
      fontSize: 'xs',
      fontWeight: 'normal',
      lineHeight: 'base',
    },
  },
} as const;
