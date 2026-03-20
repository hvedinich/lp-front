import type { BoxProps, ButtonProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export type FormAction = {
  'data-testid'?: string;
  label: ReactNode;
} & Omit<ButtonProps, 'children'>;

export interface ResolveFormControlsLayoutInput {
  forceFullWidth: boolean;
  hasLeftSlot: boolean;
  mobileFullWidth: boolean;
  sticky: boolean;
  stickyBottom: BoxProps['bottom'] | undefined;
}

export interface ResolvedFormControlsLayout {
  actionGroupShouldBreakRowBase: boolean;
  actionGroupShouldFullBase: boolean;
  actionGroupShouldFullDesktop: boolean;
  actionItemFlexBase: '1' | 'none';
  actionItemFlexDesktop: '1' | 'none';
  actionItemMinWBase: 'zero' | undefined;
  stickyBottom: BoxProps['bottom'];
  shouldApplySticky: boolean;
}

export const resolveFormControlsLayout = ({
  forceFullWidth,
  hasLeftSlot,
  mobileFullWidth,
  sticky,
  stickyBottom,
}: ResolveFormControlsLayoutInput): ResolvedFormControlsLayout => {
  const shouldStretchOnMobile = mobileFullWidth || forceFullWidth;

  return {
    actionGroupShouldBreakRowBase: hasLeftSlot,
    actionGroupShouldFullBase: hasLeftSlot || shouldStretchOnMobile,
    actionGroupShouldFullDesktop: forceFullWidth,
    actionItemFlexBase: shouldStretchOnMobile ? '1' : 'none',
    actionItemFlexDesktop: forceFullWidth ? '1' : 'none',
    actionItemMinWBase: shouldStretchOnMobile || forceFullWidth ? 'zero' : undefined,
    stickyBottom: stickyBottom ?? '1',
    shouldApplySticky: sticky,
  };
};

export const resolvePrimaryButtonProps = (action?: FormAction): ButtonProps | null => {
  if (!action) {
    return null;
  }

  return {
    ...action,
    size: action.size ?? 'md',
    type: action.type ?? 'submit',
    variant: action.variant ?? 'solid',
  };
};

export const resolveSecondaryButtonProps = (action?: FormAction): ButtonProps | null => {
  if (!action) {
    return null;
  }

  return {
    ...action,
    size: action.size ?? 'md',
    variant: action.variant ?? 'subtle',
  };
};
