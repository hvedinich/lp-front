import { defineSlotRecipe } from '@chakra-ui/react';

/**
 * Card slot recipe
 *
 * Overrides the built-in Chakra v3 card slot recipe.
 * Slots match the anatomy: root, header, body, footer, title.
 * Missing 'title' slot causes the built-in title style to be dropped on merge.
 *
 * Use layerStyle="card" on a plain Box when Card.Root/Card.Body are not needed.
 */
export const cardSlotRecipe = defineSlotRecipe({
  slots: ['root', 'header', 'body', 'footer', 'title'],

  base: {
    root: {
      bg: 'bg.surface',
      shadow: 'card',
      borderRadius: 'card',
      overflow: 'hidden',
    },
    header: {
      px: '6',
      pt: '6',
      pb: '2',
    },
    body: {
      px: '6',
      py: '4',
      flex: 1,
    },
    footer: {
      px: '6',
      pb: '6',
      pt: '2',
    },
  },

  variants: {
    /**
     * variant — card visual style.
     * elevated — with shadow (default)
     * outline  — no shadow, with border
     * ghost    — no shadow, no border
     */
    variant: {
      elevated: {
        root: {
          bg: 'bg.surface',
          shadow: 'card',
          borderWidth: 'none',
        },
      },
      outline: {
        root: {
          bg: 'bg.surface',
          shadow: 'none',
          borderWidth: 'thin',
          borderColor: 'border.default',
        },
      },
      ghost: {
        root: {
          shadow: 'none',
          borderWidth: 'none',
          bg: 'transparent',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'elevated',
  },
});
