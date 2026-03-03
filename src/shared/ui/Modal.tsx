import { CloseButton, Dialog, Drawer, useBreakpointValue } from '@chakra-ui/react';
import { type ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  footer?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
}

/**
 * Modal renders a centered Dialog on desktop and a bottom Drawer on mobile.
 */
export function Modal({ children, footer, open, onOpenChange, title }: ModalProps) {
  const isMobile = useBreakpointValue({ base: true, md: false }, { fallback: 'md' });

  if (isMobile) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={({ open: nextOpen }) => onOpenChange(nextOpen)}
        placement='bottom'
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{title}</Drawer.Title>
              <Drawer.CloseTrigger>
                <CloseButton />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body>{children}</Drawer.Body>
            {footer ? <Drawer.Footer>{footer}</Drawer.Footer> : null}
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: nextOpen }) => onOpenChange(nextOpen)}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.CloseTrigger>
              <CloseButton />
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body>{children}</Dialog.Body>
          {footer ? <Dialog.Footer>{footer}</Dialog.Footer> : null}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
