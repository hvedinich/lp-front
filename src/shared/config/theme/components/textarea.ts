import { defineRecipe } from '@chakra-ui/react';

/**
 * Textarea recipe
 *
 * Mirrors the input recipe — same base styles, same variant overrides.
 *
 * CRITICAL: Textarea in Chakra v3 uses a regular defineRecipe (NOT defineSlotRecipe).
 * This recipe MUST live in `recipes.textarea`, not `slotRecipes.textarea`.
 *
 * This config is deep-merged with the built-in recipe via createSystem(defaultConfig, ...).
 * Only delta styles are specified here; unmodified built-in styles are preserved.
 */
export const textareaRecipe = defineRecipe({
  base: {
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
      _focusVisible: {
        outlineColor: 'border.error',
      },
    },
    _readOnly: {
      bg: 'bg.subtle',
    },
  },
  variants: {
    variant: {
      outline: {
        borderColor: 'border.muted',
        bg: 'bg.input',
      },
      subtle: {
        borderColor: 'border.muted',
        bg: 'bg.input',
      },
    },
  },
});
