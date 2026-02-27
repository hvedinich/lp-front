/**
 * Semantic Layout Tokens — radii roles
 *
 * Maps semantic role names to the raw radii scale (L1 tokens/radii.ts).
 * Components use 'control', 'card', 'modal', 'pill' — never raw values.
 *
 * Visual character hierarchy (tight → rounded):
 *   control (8px) < card (12px) < modal (16px) < pill (full)
 *
 * To change overall UI roundness: update values here only.
 * Example — flat UI: set control → 'sm', card → 'md', modal → 'lg'
 * Example — rounded UI: set control → '2xl', card → '3xl', modal → '3xl'
 */

export const semanticRadiiTokens = {
  radii: {
    /** Interactive controls: inputs, buttons, selects — pill shape (matches target design) */
    control: { value: { base: '{radii.2xl}' } },
    /** Cards, panels, content containers */
    card: { value: { base: '{radii.3xl}' } }, // 12px
    /** Modals, drawers, large overlays */
    modal: { value: { base: '{radii.4xl}' } }, // 16px
    /** Badges, tags, pill-shaped elements */
    pill: { value: { base: '{radii.full}' } },
  },
} as const;
