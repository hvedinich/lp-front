/**
 * Semantic Elevation Tokens — shadow roles
 *
 * Components use shadow.card, shadow.modal, etc. —
 * not raw values from the shadows scale.
 *
 * To change overall UI depth: update the mapping here.
 * Example — flat UI: shadow.card → shadows.xs
 */

export const semanticElevationTokens = {
  shadows: {
    /** Card shadow — standard container */
    card: { value: { base: '{shadows.card}', _dark: 'none' } },
    /** Modal and drawer shadow */
    modal: { value: { base: '{shadows.lg}', _dark: '{shadows.lg}' } },
    /** Dropdown, select, popover shadow */
    dropdown: { value: { base: '{shadows.md}', _dark: '{shadows.md}' } },
    /** Inset shadow (inset field, recessed element) */
    inset: { value: { base: '{shadows.inner}', _dark: '{shadows.inner}' } },
  },
} as const;
