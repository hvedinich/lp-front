import { Box, Button, Flex, HStack, type BoxProps, type ButtonProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import {
  resolveFormControlsLayout,
  resolvePrimaryButtonProps,
  resolveSecondaryButtonProps,
  type FormAction,
} from './form-controls';

export interface FormControlsProps extends Omit<BoxProps, 'children'> {
  forceFullWidth?: boolean;
  leftSlot?: ReactNode;
  mobileFullWidth?: boolean;
  primaryAction?: FormAction;
  primarySlot?: ReactNode;
  secondaryAction?: FormAction;
  secondarySlot?: ReactNode;
  sticky?: boolean;
  stickyBottom?: BoxProps['bottom'];
}

interface ActionItemProps {
  children: ReactNode;
  flexValue: '1' | 'none';
  minW?: 'zero';
}

const ActionItem = ({ children, flexValue, minW }: ActionItemProps) => {
  return (
    <Box
      flex={flexValue}
      minW={minW}
    >
      {children}
    </Box>
  );
};

const buildActionNode = ({
  action,
  fallback,
  stretch,
}: {
  action?: FormAction;
  fallback: (action?: FormAction) => ButtonProps | null;
  stretch: boolean;
}): ReactNode => {
  const props = fallback(action);
  if (!props) {
    return null;
  }

  return (
    <Button
      {...props}
      w={stretch ? 'full' : undefined}
    >
      {action?.label}
    </Button>
  );
};

export function FormControls({
  forceFullWidth = false,
  leftSlot = null,
  mobileFullWidth = true,
  primaryAction,
  primarySlot,
  secondaryAction,
  secondarySlot,
  sticky = false,
  stickyBottom = '1' as BoxProps['bottom'],
  ...rest
}: FormControlsProps) {
  const layout = resolveFormControlsLayout({
    forceFullWidth,
    hasLeftSlot: Boolean(leftSlot),
    mobileFullWidth,
    sticky,
    stickyBottom,
  });

  const shouldStretchButtonsOnMobile = layout.actionItemFlexBase === '1';

  const resolvedSecondary =
    secondarySlot ??
    buildActionNode({
      action: secondaryAction,
      fallback: resolveSecondaryButtonProps,
      stretch: shouldStretchButtonsOnMobile,
    });

  const resolvedPrimary =
    primarySlot ??
    buildActionNode({
      action: primaryAction,
      fallback: resolvePrimaryButtonProps,
      stretch: shouldStretchButtonsOnMobile,
    });

  const hasActions = Boolean(resolvedSecondary || resolvedPrimary);

  if (!leftSlot && !hasActions) {
    return null;
  }

  const stickyProps: BoxProps = layout.shouldApplySticky
    ? {
        position: 'sticky',
        bottom: layout.stickyBottom,
        bg: 'bg.canvas',
        zIndex: 'docked',
        pt: '3',
      }
    : {};

  return (
    <Box
      w='full'
      alignSelf='stretch'
      {...stickyProps}
      {...rest}
    >
      <Flex
        justify={leftSlot ? 'space-between' : 'flex-end'}
        align='center'
        wrap={{ base: 'wrap', md: 'nowrap' }}
        gap='3'
        w='full'
      >
        {leftSlot}

        {hasActions ? (
          <>
            <HStack
              display={{ base: 'flex', md: 'none' }}
              gap='3'
              justify='end'
              w={layout.actionGroupShouldFullBase ? 'full' : undefined}
              flexBasis={layout.actionGroupShouldBreakRowBase ? 'full' : undefined}
            >
              {resolvedSecondary ? (
                <ActionItem
                  flexValue={layout.actionItemFlexBase}
                  minW={layout.actionItemMinWBase}
                >
                  {resolvedSecondary}
                </ActionItem>
              ) : null}

              {resolvedPrimary ? (
                <ActionItem
                  flexValue={layout.actionItemFlexBase}
                  minW={layout.actionItemMinWBase}
                >
                  {resolvedPrimary}
                </ActionItem>
              ) : null}
            </HStack>

            <HStack
              display={{ base: 'none', md: 'flex' }}
              gap='3'
              justify='end'
              w={layout.actionGroupShouldFullDesktop ? 'full' : undefined}
              flex='1'
            >
              {resolvedSecondary ? (
                <ActionItem flexValue={layout.actionItemFlexDesktop}>
                  {resolvedSecondary}
                </ActionItem>
              ) : null}

              {resolvedPrimary ? (
                <ActionItem flexValue={layout.actionItemFlexDesktop}>{resolvedPrimary}</ActionItem>
              ) : null}
            </HStack>
          </>
        ) : null}
      </Flex>
    </Box>
  );
}
