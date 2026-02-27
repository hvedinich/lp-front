import { ratingColors } from '../tokens/colors';

/**
 * L2 — Semantic Color Tokens (roles)
 *
 * ✅ Only these tokens are used in components and JSX.
 * ❌ Forbidden in components: brand.500, gray.200, hex values.
 *
 * Format: { base: "light-value", _dark: "dark-value" }
 * _dark is currently a placeholder (same as base).
 * Dark mode activates via next-themes ThemeProvider (attribute="class") — no token refactoring needed.
 *
 * Rule: one token = one role. No two tokens with the same resolved value.
 * Rule: bg.brand.*, bg.interactive.* — only inside component recipes,
 * not directly in JSX via _hover={{ bg: 'bg.brand.hover' }}.
 */

export const semanticColorTokens = {
  colors: {
    // ─────────────────────────────────────────────────────────────
    // Text (fg)
    // ─────────────────────────────────────────────────────────────

    fg: {
      /** Primary page text */
      default: { value: { base: '{colors.gray.800}', _dark: '#E2E8F0' } },
      /** Secondary text, labels, captions */
      muted: { value: { base: '{colors.gray.500}', _dark: '#858585' } },
      /** Placeholder, disabled text */
      subtle: { value: { base: '{colors.gray.400}', _dark: '#585858' } },
      /** Inverted text for dark backgrounds */
      inverse: { value: { base: 'white', _dark: '{colors.gray.900}' } },

      /** Brand text color: links, accent */
      brand: { value: { base: '{colors.brand.600}', _dark: '{colors.brand.400}' } },
      /** Error text color */
      error: { value: { base: '{colors.error.600}', _dark: '{colors.error.400}' } },
      /** Success text color */
      success: { value: { base: '{colors.success.600}', _dark: '{colors.success.400}' } },
      /** Warning text color */
      warning: { value: { base: '{colors.warning.600}', _dark: '{colors.warning.400}' } },

      /** Text on brand fill (solid button) */
      onBrand: { value: { base: 'white', _dark: 'white' } },
      /** Text on error fill */
      onError: { value: { base: 'white', _dark: 'white' } },
      /** Text on success fill */
      onSuccess: { value: { base: 'white', _dark: 'white' } },

      /**
       * Accent — violet for links, focus decorations, selected states.
       * Separate from brand (red). White-label: swap accent palette in colors.ts.
       */
      accent: { value: { base: '{colors.accent.600}', _dark: '{colors.accent.400}' } },

      /** Active star color — amber yellow */
      ratingActive: { value: { base: ratingColors.active, _dark: ratingColors.active } },
      /** Inactive star color — muted blue-gray */
      ratingInactive: {
        value: { base: ratingColors.inactive, _dark: ratingColors.inactiveDark },
      },

      /** Informational text — blue */
      info: { value: { base: '{colors.blue.600}', _dark: '{colors.blue.400}' } },
    },

    // ─────────────────────────────────────────────────────────────
    // Surface backgrounds (bg)
    // ─────────────────────────────────────────────────────────────

    bg: {
      /** Page background (body, main area) */
      canvas: { value: { base: 'white', _dark: '#333333' } },
      /** Card, panel */
      surface: { value: { base: '#f9f9fa', _dark: '#535353' } },
      /** Modal, popover — same as surface in light, slightly elevated in dark */
      elevated: { value: { base: 'white', _dark: '#252836' } },
      /** Input fields, form elements */
      input: { value: { base: 'white', _dark: '#2e2e2e' } },
      /** Secondary stripes, inset sections, zebra rows */
      subtle: { value: { base: '{colors.accent.100}', _dark: '{colors.accent.100}' } },
      /** Modal backdrop — uses rgba to avoid dependency on Chakra internal blackAlpha token */
      overlay: { value: { base: 'rgba(0, 0, 0, 0.6)', _dark: 'rgba(0, 0, 0, 0.75)' } },

      // ── Brand backgrounds (component recipes only) ────────────
      /** Main brand button — resting state */
      brand: {
        DEFAULT: { value: { base: '{colors.brand.100}', _dark: '{colors.brand.600}' } },
        /** Hover state for brand button — recipes only */
        hover: { value: { base: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
        /** Active state for brand button — recipes only */
        active: { value: { base: '{colors.brand.700}', _dark: '{colors.brand.400}' } },
      },

      // ── Dark surface (black/near-black button, SnowUI CTA) ────
      /** Dark button background — resting */
      dark: {
        DEFAULT: { value: { base: '{colors.gray.900}', _dark: '{colors.gray.100}' } },
        /** Hover state for dark button — recipes only */
        hover: { value: { base: '{colors.gray.700}', _dark: '{colors.gray.200}' } },
        /** Active state for dark button — recipes only */
        active: { value: { base: '{colors.gray.600}', _dark: '{colors.gray.300}' } },
      },

      // ── Interactive backgrounds (component recipes only) ─────────────────
      /** Neutral element — resting state */
      interactive: {
        DEFAULT: { value: { base: 'transparent', _dark: 'transparent' } },
        /** Ghost/outline element hover — recipes only */
        hover: { value: { base: '{colors.gray.100}', _dark: '#252D42' } },
        /** Ghost/outline element active — recipes only */
        active: { value: { base: '{colors.gray.200}', _dark: '#2D3555' } },
      },

      // ── Accent (white-label space) ────────────────────────────
      /**
       * Accent background — violet, separate from brand.
       * White-label: swap accent palette in colors.ts.
       */
      accent: { value: { base: '{colors.accent.500}', _dark: '{colors.accent.500}' } },

      // ── Status backgrounds ────────────────────────────────────
      /** Background block for errors (alert, toast, field error) */
      error: { value: { base: '{colors.error.50}', _dark: '{colors.error.900}' } },
      /** Background block for success states */
      success: { value: { base: '{colors.success.50}', _dark: '{colors.success.900}' } },
      /** Background block for warnings */
      warning: { value: { base: '{colors.warning.50}', _dark: '{colors.warning.900}' } },
      /** Background block for informational states (blue) */
      info: { value: { base: '{colors.blue.50}', _dark: '{colors.blue.900}' } },

      // ── Gradients ──────────────────────────────────────────────────────
      gradient: {
        /** Brand gradient for buttons, banners */
        brand: {
          value: {
            base: 'linear-gradient(69.3deg, {colors.brand.400} 16.57%, {colors.brand.600} 108.7%)',
            _dark: 'linear-gradient(69.3deg, {colors.brand.400} 16.57%, {colors.brand.600} 108.7%)',
          },
        },
        /**
         * Hero section — fill in when hero design is available.
         * TODO: replace placeholder with real gradient.
         */
        // Auth page background — violet-tinted gradient matching SnowUI auth screens
        hero: {
          value: {
            base: 'linear-gradient(0deg, {colors.brand.100} 0%, {colors.brand.50} 100%)',
            _dark: 'linear-gradient(0deg, {colors.gray.900} 0%, {colors.gray.700} 100%)',
          },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Borders (border)
    // ─────────────────────────────────────────────────────────────

    border: {
      /** Primary border for elements (input, card, divider) — subtle in SnowUI */
      default: { value: { base: '{colors.gray.200}', _dark: '#525252' } },
      /** Lighter border, background dividers */
      muted: { value: { base: '{colors.gray.100}', _dark: '#585858' } },
      /** Barely-visible border — one step lighter than border.muted */
      subtle: { value: { base: '{colors.gray.50}', _dark: '#1C1F2E' } },
      /** Border on focus (keyboard navigation) */
      focus: { value: { base: '{colors.gray.400}', _dark: '#9BA3AF' } },
      /**
       * Focus ring color — violet accent, matches SnowUI focus style.
       * Used in recipes: _focusVisible: { outlineColor: 'border.focusRing' }
       */
      focusRing: { value: { base: '{colors.accent.500}', _dark: '{colors.accent.400}' } },
      /** Brand-colored border (red) */
      brand: { value: { base: '{colors.brand.500}', _dark: '{colors.brand.400}' } },
      /** Error state border */
      error: { value: { base: '{colors.error.500}', _dark: '{colors.error.400}' } },
      /** Info state border */
      info: { value: { base: '{colors.blue.400}', _dark: '{colors.blue.500}' } },

      /**
       * Accent border — violet, matches focusRing.
       * White-label: swap accent palette in colors.ts.
       */
      accent: { value: { base: '{colors.accent.500}', _dark: '{colors.accent.400}' } },
    },

    // ─────────────────────────────────────────────────────────────
    // colorPalette convention tokens
    //
    // These follow Chakra v3's colorPalette API naming convention.
    // Components that use colorPalette.* in their recipes can be
    // overridden at usage site: <Button colorPalette='blue'> etc.
    //
    // White-label: swap brand.* values to change the entire product color.
    // ─────────────────────────────────────────────────────────────

    brand: {
      /** Solid fill — main button/badge background */
      solid: { value: { base: '{colors.brand.500}', _dark: '{colors.brand.600}' } },
      /** Text on solid fill — must pass contrast check against brand.solid */
      contrast: { value: { base: 'white', _dark: 'white' } },
      /** Foreground text in brand context (links, tinted text) */
      fg: { value: { base: '{colors.brand.600}', _dark: '{colors.brand.400}' } },
      /** Lightest tinted background */
      subtle: { value: { base: '{colors.brand.50}', _dark: '{colors.brand.900}' } },
      /** Medium tinted background */
      muted: { value: { base: '{colors.brand.100}', _dark: '{colors.brand.800}' } },
      /** Stronger tinted background */
      emphasized: { value: { base: '{colors.brand.200}', _dark: '{colors.brand.700}' } },
      /** Focus ring for brand-colored interactive elements */
      focusRing: { value: { base: '{colors.brand.400}', _dark: '{colors.brand.400}' } },
      /** Border for brand-context containers */
      border: { value: { base: '{colors.brand.200}', _dark: '{colors.brand.700}' } },
    },

    accent: {
      /** Solid fill — violet accent for links, focus states */
      solid: { value: { base: '{colors.accent.600}', _dark: '{colors.accent.400}' } },
      /** Text on solid fill — must pass contrast check against accent.solid */
      contrast: { value: { base: 'white', _dark: 'white' } },
      /** Foreground text in accent context (links, tinted text) */
      fg: { value: { base: '{colors.accent.600}', _dark: '{colors.accent.400}' } },
      /** Lightest tinted background */
      subtle: { value: { base: '{colors.accent.50}', _dark: '{colors.accent.900}' } },
      /** Medium tinted background */
      muted: { value: { base: '{colors.accent.100}', _dark: '{colors.accent.800}' } },
      /** Stronger tinted background */
      emphasized: { value: { base: '{colors.accent.200}', _dark: '{colors.accent.700}' } },
      /** Focus ring for accent-colored interactive elements */
      focusRing: { value: { base: '{colors.accent.500}', _dark: '{colors.accent.400}' } },
      /** Border for accent-context containers */
      border: { value: { base: '{colors.accent.200}', _dark: '{colors.accent.700}' } },
    },

    /**
     * dark — near-black palette for high-contrast CTAs: dark buttons, checkboxes.
     * White-label: swap gray.900 for a dark brand color to tint the CTA.
     */
    dark: {
      /** Solid fill — near-black */
      solid: { value: { base: '{colors.gray.900}', _dark: '{colors.gray.100}' } },
      /** Text on solid fill */
      contrast: { value: { base: 'white', _dark: '{colors.gray.900}' } },
      /** Foreground text in dark context */
      fg: { value: { base: '{colors.gray.800}', _dark: '{colors.gray.200}' } },
      /** Lightest tint */
      subtle: { value: { base: '{colors.gray.50}', _dark: '{colors.gray.800}' } },
      /** Medium tint */
      muted: { value: { base: '{colors.gray.100}', _dark: '{colors.gray.700}' } },
      /** Stronger tint */
      emphasized: { value: { base: '{colors.gray.200}', _dark: '{colors.gray.600}' } },
      /** Focus ring */
      focusRing: { value: { base: '{colors.gray.500}', _dark: '{colors.gray.400}' } },
      /** Border */
      border: { value: { base: '{colors.gray.300}', _dark: '{colors.gray.600}' } },
    },
  },
} as const;
