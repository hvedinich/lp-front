import { Button, Flex, Text } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isLoading,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <Flex
          gap='2'
          w='full'
        >
          <Button
            flexGrow={1}
            type='button'
            variant='subtle'
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            flexGrow={1}
            type='button'
            loading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Flex>
      }
    >
      {description ? <Text>{description}</Text> : null}
    </Modal>
  );
}
