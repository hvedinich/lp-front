import { defineRecipe } from '@chakra-ui/react';

/**
 * Button recipe
 *
 * Uses Chakra v3's colorPalette system instead of hardcoded semantic tokens.
 * This means ANY color palette can override the default via colorPalette prop:
 *   <Button>                     → brand (default)
 *   <Button colorPalette='blue'> → blue
 *   <Button colorPalette='gray'> → gray
 *
 * colorPalette: 'brand' in base sets the default.
 * The brand.* semantic tokens (solid, contrast, fg, etc.) must exist — see
 * semanticTokens/colors.ts for the colorPalette convention token definitions.
 *
 * To add a new intent (e.g. success), add success.* colorPalette tokens
 * in semanticTokens/colors.ts — no recipe changes needed.
 */
export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: 'semibold',
    borderRadius: 'control',
    // 'common' covers: background, border, color, fill, stroke, opacity, box-shadow, transform
    transitionProperty: 'common',
    transitionDuration: 'fast',
    _focusVisible: {
      outlineWidth: 'medium',
      outlineStyle: 'solid',
      outlineColor: 'border.focusRing',
      outlineOffset: '[2px]',
    },
    _disabled: {
      layerStyle: 'disabled',
    },
  },

  variants: {
    variant: {
      /**
       * solid — filled background, high contrast text.
       * colorPalette.solid/90 uses Chakra's alpha modifier syntax.
       */
      solid: {
        bg: 'colorPalette.solid',
        color: 'colorPalette.contrast',
        _hover: {
          bg: 'colorPalette.solid/85',
        },
        _active: {
          bg: 'colorPalette.solid/75',
        },
      },

      /**
       * outline — border only, transparent background.
       * Secondary actions alongside a solid primary.
       */
      outline: {
        bg: 'transparent',
        borderWidth: 'thin',
        borderColor: 'colorPalette.border',
        color: 'colorPalette.fg',
        _hover: {
          bg: 'colorPalette.subtle',
        },
        _active: {
          bg: 'colorPalette.muted',
        },
      },

      /**
       * ghost — no border, no background.
       * Navigation, icon buttons, low-emphasis actions.
       */
      ghost: {
        bg: 'transparent',
        color: 'colorPalette.fg',
        _hover: {
          bg: 'colorPalette.subtle',
        },
        _active: {
          bg: 'colorPalette.muted',
        },
      },
    },

    size: {
      sm: { h: '8', px: '3', fontSize: 'sm' },
      md: { h: '10', px: '4', fontSize: 'sm' },
      lg: { h: '12', px: '6', fontSize: 'md' },
    },
  },

  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});
