/**
 * Theme entry point for lp-front design system.
 *
 * Architecture:
 *   L1 (tokens/)         — raw primitives: brand.500, gray.200, shadows.sm
 *   L2 (semanticTokens/) — named roles: fg.error, bg.surface, border.focus
 *
 * Developer rules, white-label setup and token addition guide: THEME_PLAN.md
 */

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import { colorTokens } from './tokens/colors';
import { fontTokens } from './tokens/typography';
import { radiiTokens } from './tokens/radii';
import { shadowTokens } from './tokens/shadows';
import { borderWidthTokens } from './tokens/borderWidths';

import { semanticColorTokens } from './semanticTokens/colors';
import { semanticElevationTokens } from './semanticTokens/elevation';
import { semanticRadiiTokens } from './semanticTokens/layout';
import { textStyles } from './semanticTokens/typography';

import { layerStyles } from './layerStyles/surfaces';

import { buttonRecipe } from './components/button';
import { inputRecipe } from './components/input';
import { cardSlotRecipe } from './components/card';
import { nativeSelectSlotRecipe } from './components/nativeSelect';
import { checkboxSlotRecipe } from './components/checkbox';

// ─────────────────────────────────────────────────────────────────────────────
// Base config — exported for white-label extension
// ─────────────────────────────────────────────────────────────────────────────

export const brandBaseConfig = defineConfig({
  /**
   * strictTokens: true — TypeScript forbids raw CSS values in style props.
   * Writing color="red" or bg="#ff0000" becomes a compile-time error.
   * Enforces the "semantic tokens only" rule at the type level.
   */
  strictTokens: true,

  theme: {
    tokens: {
      colors: colorTokens,
      ...fontTokens,
      ...radiiTokens,
      ...shadowTokens,
      ...borderWidthTokens,
      /**
       * Viewport size tokens.
       * Usage: minH='dvh', minH='vh', minH='svh'
       * Avoids escape-hatch strings like '[100dvh]' which bypass strictTokens
       * and can silently fail in some rendering contexts.
       */
      sizes: {
        dvh: { value: '100dvh' },
        svh: { value: '100svh' },
        lvh: { value: '100lvh' },
        vh: { value: '100vh' },
        /**
         * Layout dimension tokens.
         * Usage: width='layout.sidebar.w', h='layout.header.h', maxH='layout.mobileDrawer.h'
         * Centralizes layout sizes so they can be changed in one place.
         */
        layout: {
          sidebar: {
            w: { value: '18rem' },
            collapsedW: { value: '4rem' },
          },
          header: {
            h: { value: '3.5rem' },
          },
          mobileDrawer: {
            h: { value: '24rem' },
          },
        },
      },
    },

    semanticTokens: {
      colors: semanticColorTokens.colors,
      shadows: semanticElevationTokens.shadows,
      ...semanticRadiiTokens,
    },

    textStyles,
    layerStyles,

    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
    },

    slotRecipes: {
      card: cardSlotRecipe,
      nativeSelect: nativeSelectSlotRecipe,
      checkbox: checkboxSlotRecipe,
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main system — used in ChakraProvider
// ─────────────────────────────────────────────────────────────────────────────

export const system = createSystem(defaultConfig, brandBaseConfig);
