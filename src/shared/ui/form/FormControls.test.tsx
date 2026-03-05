import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { FormControls } from './FormControls';

type AnyElement = ReactElement<Record<string, unknown>>;

const asElement = (value: unknown): AnyElement => value as AnyElement;
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value]);

describe('FormControls', () => {
  it('renders secondary before primary in actions groups', () => {
    const element = FormControls({
      secondaryAction: { label: 'Previous' },
      primaryAction: { label: 'Submit' },
    }) as AnyElement;

    const stickyLayer = asElement(element.props.children);
    const flex = asElement(stickyLayer.props.children);
    const children = asArray(flex.props.children);
    const mobileGroup = asElement(children[0]);

    const actionItems = asArray(mobileGroup.props.children);
    const secondaryButton = asElement(asElement(actionItems[0]).props.children);
    const primaryButton = asElement(asElement(actionItems[1]).props.children);

    expect(secondaryButton.props.children).toBe('Previous');
    expect(primaryButton.props.children).toBe('Submit');
  });

  it('uses slots over action props when slot is provided', () => {
    const element = FormControls({
      secondaryAction: { label: 'Cancel' },
      primaryAction: { label: 'Save' },
      secondarySlot: 'Custom Secondary',
      primarySlot: 'Custom Primary',
    }) as AnyElement;

    const stickyLayer = asElement(element.props.children);
    const flex = asElement(stickyLayer.props.children);
    const mobileGroup = asElement(asArray(flex.props.children)[0]);
    const actionItems = asArray(mobileGroup.props.children);

    expect(asElement(actionItems[0]).props.children).toBe('Custom Secondary');
    expect(asElement(actionItems[1]).props.children).toBe('Custom Primary');
  });

  it('applies sticky bottom visual props when sticky=true', () => {
    const element = FormControls({
      sticky: true,
      stickyBottom: '4',
      primaryAction: { label: 'Save' },
    }) as AnyElement;

    const stickyLayer = asElement(element.props.children);

    expect(stickyLayer.props.position).toBe('sticky');
    expect(stickyLayer.props.bottom).toBe('4');
    expect(stickyLayer.props.bg).toBe('bg.canvas');
    expect(stickyLayer.props.borderTopWidth).toBe('thin');
    expect(stickyLayer.props.borderColor).toBe('border.default');
  });

  it('applies mobile full-width flex behavior for actions by default', () => {
    const element = FormControls({
      secondaryAction: { label: 'Previous' },
      primaryAction: { label: 'Submit' },
    }) as AnyElement;

    const stickyLayer = asElement(element.props.children);
    const flex = asElement(stickyLayer.props.children);
    const mobileGroup = asElement(asArray(flex.props.children)[0]);
    const actionItems = asArray(mobileGroup.props.children);

    expect(mobileGroup.props.w).toBe('full');
    expect(asElement(actionItems[0]).props.flex).toBe('1');
    expect(asElement(actionItems[1]).props.flex).toBe('1');
    expect(asElement(actionItems[0]).props.minW).toBe('zero');

    const firstButton = asElement(asElement(actionItems[0]).props.children);
    expect(firstButton.props.w).toBe('full');
  });

  it('places left slot and action group on wrapped mobile layout', () => {
    const element = FormControls({
      leftSlot: 'Delete',
      primaryAction: { label: 'Save' },
    }) as AnyElement;

    const stickyLayer = asElement(element.props.children);
    const flex = asElement(stickyLayer.props.children);
    const children = asArray(flex.props.children);
    const leftNode = asElement(children[0]);
    const mobileGroup = asElement(children[1]);

    expect(leftNode.props.children).toBe('Delete');
    expect(mobileGroup.props.flexBasis).toBe('full');
    expect(mobileGroup.props.w).toBe('full');
  });
});
