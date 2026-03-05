import { defineSlotRecipe } from '@chakra-ui/react';

/**
 * Toast slot recipe
 *
 * Soft, neutral surface by default with subtle semantic status backgrounds.
 * Keeps the look aligned with card/input styling in the design system.
 */
export const toastSlotRecipe = defineSlotRecipe({
  slots: ['root', 'title', 'description', 'indicator', 'actionTrigger', 'closeTrigger'],

  base: {
    root: {
      bg: 'bg.surface',
      color: 'fg.default',
      borderWidth: 'thin',
      borderColor: 'border.default',
      borderRadius: 'card',
      boxShadow: 'card',
      py: '3',
      ps: '4',
      pe: '6',
      gap: '3',
      '&[data-type=warning]': {
        bg: 'bg.warning',
      },
      '&[data-type=success]': {
        bg: 'bg.success',
      },
      '&[data-type=error]': {
        bg: 'bg.error',
        borderColor: 'border.error',
      },
      '&[data-type=info]': {
        bg: 'bg.info',
        borderColor: 'border.info',
      },
    },
    title: {
      fontWeight: 'semibold',
      textStyle: 'sm',
      marginEnd: '2',
    },
    description: {
      display: 'inline',
      textStyle: 'sm',
      color: 'fg.muted',
    },
    indicator: {
      flexShrink: '0',
      boxSize: '5',
      color: 'fg.muted',
      '[data-type=warning] &': {
        color: 'fg.warning',
      },
      '[data-type=success] &': {
        color: 'fg.success',
      },
      '[data-type=error] &': {
        color: 'fg.error',
      },
      '[data-type=info] &': {
        color: 'fg.info',
      },
    },
    actionTrigger: {
      textStyle: 'sm',
      fontWeight: 'medium',
      height: '8',
      px: '3',
      borderRadius: 'control',
      alignSelf: 'center',
      borderWidth: 'thin',
      borderColor: 'border.default',
      transitionProperty: 'common',
      transitionDuration: 'fast',
      _hover: {
        bg: 'bg.interactive.hover',
      },
    },
    closeTrigger: {
      position: 'absolute',
      top: '1',
      insetEnd: '1',
      p: '1',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'fg.muted',
      borderRadius: 'control',
      textStyle: 'md',
      transitionProperty: 'common',
      transitionDuration: 'fast',
      _hover: {
        bg: 'bg.interactive.hover',
        color: 'fg.default',
      },
      _icon: {
        boxSize: '1em',
      },
    },
  },
});
