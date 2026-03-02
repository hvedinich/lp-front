import { defineSlotRecipe } from '@chakra-ui/react';

/**
 * NativeSelect slot recipe
 *
 * Overrides the built-in Chakra v3 nativeSelect slot recipe.
 * Slots: root, field, indicator
 *
 * Applies the same visual style as Input: pill radius, subtle bg, muted border.
 * This recipe must live in slotRecipes.nativeSelect.
 */
export const nativeSelectSlotRecipe = defineSlotRecipe({
  slots: ['root', 'field', 'indicator'],

  base: {
    field: {
      borderRadius: 'control',
      color: 'fg.default',
      _placeholder: {
        color: 'fg.subtle',
      },
      _hover: {
        borderColor: 'border.default',
        bg: 'bg.input',
      },
      _focusVisible: {
        borderColor: 'border.focus',
        bg: 'bg.input',
        outlineColor: 'border.focusRing',
      },
      _invalid: {
        borderColor: 'border.error',
        bg: 'bg.error',
      },
      _disabled: {
        layerStyle: 'disabled',
      },
    },
  },

  variants: {
    variant: {
      outline: {
        field: {
          borderColor: 'border.muted',
          bg: 'bg.input',
        },
      },
      subtle: {
        field: {
          borderColor: 'border.muted',
          bg: 'bg.input',
        },
      },
    },
  },
});
