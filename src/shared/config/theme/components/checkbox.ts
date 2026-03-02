import { defineSlotRecipe } from '@chakra-ui/react';

/**
 * Checkbox slot recipe
 *
 * Overrides the built-in Chakra v3 checkbox slot recipe.
 * Slots: root, control, label
 *
 * Variants:
 *   solid   — filled on check (default): dark.solid bg, white icon
 *   outline — border only on check: no fill, colorPalette.fg icon + colorPalette.solid border
 *
 * To change default color: set colorPalette prop at usage site.
 *   <Checkbox>                      → dark (black)
 *   <Checkbox colorPalette='brand'> → brand red
 */
export const checkboxSlotRecipe = defineSlotRecipe({
  slots: ['root', 'control', 'label'],

  base: {
    root: {
      colorPalette: 'dark', // default — overridden by colorPalette prop
    },
    control: {
      borderRadius: 'sm', // slight rounding — matches design (not pill, not sharp)
      borderWidth: 'medium',
      borderColor: 'border.default',
      bg: 'bg.surface',
      transitionProperty: 'common',
      transitionDuration: 'fast',
      _focusVisible: {
        outlineWidth: 'medium',
        outlineStyle: 'solid',
        outlineColor: 'border.focusRing',
        outlineOffset: '[2px]',
      },
      _invalid: {
        borderColor: 'border.error',
        colorPalette: 'brand',
      },
    },
    label: {
      userSelect: 'none',
      color: 'fg.default',
      _disabled: {
        layerStyle: 'disabled',
      },
    },
  },

  variants: {
    variant: {
      /**
       * solid — filled background on checked/indeterminate.
       * Default variant. Black fill with white checkmark.
       */
      solid: {
        control: {
          '&:is([data-state=checked], [data-state=indeterminate])': {
            bg: 'colorPalette.solid',
            borderColor: 'colorPalette.solid',
            color: 'colorPalette.contrast',
          },
        },
      },

      /**
       * outline — no fill, only border changes color on checked.
       * Checkmark uses colorPalette.fg (dark text color).
       */
      outline: {
        control: {
          '&:is([data-state=checked], [data-state=indeterminate])': {
            bg: 'bg.surface',
            borderColor: 'colorPalette.solid',
            color: 'colorPalette.fg',
          },
        },
      },
    },
  },

  defaultVariants: {
    variant: 'solid',
  },
});
