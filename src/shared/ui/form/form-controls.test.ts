import { describe, expect, it } from 'vitest';
import {
  resolveFormControlsLayout,
  resolvePrimaryButtonProps,
  resolveSecondaryButtonProps,
} from './form-controls';

describe('resolveFormControlsLayout', () => {
  it('stretches actions on mobile with mobileFullWidth=true', () => {
    const layout = resolveFormControlsLayout({
      forceFullWidth: false,
      hasLeftSlot: false,
      mobileFullWidth: true,
      sticky: false,
      stickyBottom: '[0px]',
    });

    expect(layout.actionGroupShouldFullBase).toBe(true);
    expect(layout.actionItemFlexBase).toBe('1');
    expect(layout.actionItemMinWBase).toBe('zero');
  });

  it('keeps desktop auto width unless forceFullWidth=true', () => {
    const layout = resolveFormControlsLayout({
      forceFullWidth: false,
      hasLeftSlot: false,
      mobileFullWidth: true,
      sticky: false,
      stickyBottom: '[0px]',
    });

    expect(layout.actionGroupShouldFullDesktop).toBe(false);
    expect(layout.actionItemFlexDesktop).toBe('none');
  });

  it('forces full width on all breakpoints when forceFullWidth=true', () => {
    const layout = resolveFormControlsLayout({
      forceFullWidth: true,
      hasLeftSlot: false,
      mobileFullWidth: false,
      sticky: false,
      stickyBottom: '[0px]',
    });

    expect(layout.actionGroupShouldFullBase).toBe(true);
    expect(layout.actionGroupShouldFullDesktop).toBe(true);
    expect(layout.actionItemFlexBase).toBe('1');
    expect(layout.actionItemFlexDesktop).toBe('1');
  });

  it('moves actions to full-width row when left slot exists on mobile', () => {
    const layout = resolveFormControlsLayout({
      forceFullWidth: false,
      hasLeftSlot: true,
      mobileFullWidth: false,
      sticky: false,
      stickyBottom: '[0px]',
    });

    expect(layout.actionGroupShouldBreakRowBase).toBe(true);
    expect(layout.actionGroupShouldFullBase).toBe(true);
  });

  it('keeps bottom token and sticky flag', () => {
    const layout = resolveFormControlsLayout({
      forceFullWidth: false,
      hasLeftSlot: false,
      mobileFullWidth: true,
      sticky: true,
      stickyBottom: '4',
    });

    expect(layout.stickyBottom).toBe('4');
    expect(layout.shouldApplySticky).toBe(true);
  });
});

describe('button prop resolvers', () => {
  it('applies defaults for primary action and keeps explicit type override', () => {
    const primaryDefault = resolvePrimaryButtonProps({ label: 'Save' });
    expect(primaryDefault).toMatchObject({
      size: 'md',
      type: 'submit',
      variant: 'solid',
    });

    const primaryExplicit = resolvePrimaryButtonProps({
      label: 'Send',
      type: 'button',
      variant: 'outline',
    });

    expect(primaryExplicit).toMatchObject({
      type: 'button',
      variant: 'outline',
    });
  });

  it('applies defaults for secondary action', () => {
    const secondary = resolveSecondaryButtonProps({ label: 'Cancel' });

    expect(secondary).toMatchObject({
      size: 'md',
      variant: 'outline',
    });
  });
});
