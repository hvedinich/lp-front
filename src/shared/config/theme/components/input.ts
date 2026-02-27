import { defineRecipe } from '@chakra-ui/react';

/**
 * Input recipe
 *
 * Overrides the built-in Chakra v3 input recipe.
 *
 * CRITICAL: Input in Chakra v3 uses a regular defineRecipe (NOT defineSlotRecipe).
 * This recipe MUST live in `recipes.input`, not `slotRecipes.input`.
 * A slot recipe under slotRecipes.input is a dead entry — <Input /> never reads it,
 * which is why borderRadius and color overrides had no effect.
 *
 * This config is deep-merged with the built-in recipe via createSystem(defaultConfig, ...).
 * Only delta styles are specified here; unmodified built-in styles are preserved.
 */
export const inputRecipe = defineRecipe({
  base: {
    borderRadius: 'control',
    color: 'fg.default',
    _placeholder: {
      color: 'fg.subtle',
    },
    _hover: {
      borderColor: 'border.default',
      bg: 'bg.surface',
    },
    _focusVisible: {
      borderColor: 'border.focus',
      bg: 'bg.surface',
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
        bg: 'bg.surface',
      },
      subtle: {
        borderColor: 'border.muted',
        bg: 'bg.surface',
      },
    },
  },
});
