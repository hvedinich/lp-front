/**
 * Layer Styles — surface roles
 *
 * Applied via layerStyle="card", layerStyle="panel" on any Box/Flex/Stack.
 * Components do NOT set bg/shadow/borderRadius directly for containers.
 *
 * To change visual character (flat / soft / high-contrast):
 *   - Set radii.card → radii.control (flat UI)
 *   - Remove shadow.card (flat design)
 *   - Set bg.surface → bg.subtle (tinted background)
 */

export const layerStyles = {
  /**
   * card — standard card container.
   * Use for any content container (form, list, widget).
   */
  card: {
    bg: 'bg.surface',
    shadow: 'card',
    borderRadius: 'card',
  },

  /**
   * modal — modal window, drawer, popover panel.
   * Higher than card in the elevation hierarchy.
   */
  modal: {
    bg: 'bg.elevated',
    shadow: 'modal',
    borderRadius: 'modal',
  },

  /**
   * panel — panel with explicit border (sidebar, section header).
   * No shadow — border replaces elevation.
   */
  panel: {
    bg: 'bg.surface',
    borderWidth: 'thin',
    borderColor: 'border.default',
  },

  /**
   * subtle — secondary container without borders or shadows.
   * For inset sections, zebra stripes, filter wrappers.
   */
  subtle: {
    bg: 'bg.subtle',
  },
} as const;
