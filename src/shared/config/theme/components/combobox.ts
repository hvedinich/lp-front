import { defineSlotRecipe } from '@chakra-ui/react';

/**
 * Combobox slot recipe
 *
 * Partial override of Chakra v3 built-in combobox slot recipe.
 * Keeps default behavior/structure and aligns control visuals with Input.
 */
export const comboboxSlotRecipe = defineSlotRecipe({
  slots: [
    'root',
    'item',
    'itemIndicator',
    'positioner',
    'content',
    'list',
    'control',
    'label',
    'trigger',
    'input',
    'itemGroup',
    'clearTrigger',
    'itemGroupLabel',
    'itemText',
    'indicatorGroup',
    'empty',
  ],

  base: {
    input: {
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
      _disabled: {
        layerStyle: 'disabled',
      },
    },
    trigger: {
      color: 'fg.muted',
    },
  },

  variants: {
    variant: {
      outline: {
        input: {
          borderColor: 'border.muted',
          bg: 'bg.input',
        },
      },
      subtle: {
        input: {
          borderColor: 'border.muted',
          bg: 'bg.input',
        },
      },
    },
  },
});
