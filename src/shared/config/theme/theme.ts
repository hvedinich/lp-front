/**
 * Theme entry point for lp-front design system.
 *
 * Architecture:
 *   L1 (tokens/)         — raw primitives: brand.500, gray.200, shadows.sm
 *   L2 (semanticTokens/) — named roles: fg.error, bg.surface, border.focus
 *
 * Developer rules, white-label setup and token addition guide: ARCHITECTURE.md
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
import { textareaRecipe } from './components/textarea';
import { cardSlotRecipe } from './components/card';
import { nativeSelectSlotRecipe } from './components/nativeSelect';
import { checkboxSlotRecipe } from './components/checkbox';
import { comboboxSlotRecipe } from './components/combobox';
import separatorRecipe from './components/separator';

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
       * Size tokens.
       */
      sizes: {
        /**
         * zero — explicit 0 size; used for flex min-height/min-width reset
         * (overrides the implicit `min-height: auto` on flex children).
         * Usage: minH='zero' instead of the escape-hatch '[0]' syntax.
         */
        zero: { value: '0px' },
        /**
         * dvh{n} — dynamic viewport height fractions backed by a JS CSS variable.
         * `--dvh` is set to `window.innerHeight` in px by `useDvh()` (wired in _app.tsx).
         * This fixes mobile Safari/Chrome where `100dvh` includes the address bar.
         * Naming follows the old Reviews app convention (dvh100).
         *
         * Usage: h='dvh100', minH='dvh80', maxH='dvh50', etc.
         */
        dvh10: { value: 'calc(var(--dvh, 100vh) * 0.1)' },
        dvh20: { value: 'calc(var(--dvh, 100vh) * 0.2)' },
        dvh25: { value: 'calc(var(--dvh, 100vh) * 0.25)' },
        dvh33: { value: 'calc(var(--dvh, 100vh) * 0.33)' },
        dvh40: { value: 'calc(var(--dvh, 100vh) * 0.4)' },
        dvh50: { value: 'calc(var(--dvh, 100vh) * 0.5)' },
        dvh60: { value: 'calc(var(--dvh, 100vh) * 0.6)' },
        dvh66: { value: 'calc(var(--dvh, 100vh) * 0.66)' },
        dvh75: { value: 'calc(var(--dvh, 100vh) * 0.75)' },
        dvh80: { value: 'calc(var(--dvh, 100vh) * 0.8)' },
        dvh90: { value: 'calc(var(--dvh, 100vh) * 0.9)' },
        dvh100: { value: 'var(--dvh, 100vh)' },
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
      textarea: textareaRecipe,
      separator: separatorRecipe,
    },

    slotRecipes: {
      card: cardSlotRecipe,
      nativeSelect: nativeSelectSlotRecipe,
      checkbox: checkboxSlotRecipe,
      combobox: comboboxSlotRecipe,
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main system — used in ChakraProvider
// ─────────────────────────────────────────────────────────────────────────────

export const system = createSystem(defaultConfig, brandBaseConfig);
