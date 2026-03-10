import { Button } from '@chakra-ui/react';
import { AppLink } from '../AppLink';
import { AppIcon } from '../icons';
import type { EmptyStateCta } from './types';

export function EmptyStateCtaButton({ href, icon, label, onClick }: EmptyStateCta) {
  const content = (
    <>
      {icon ? (
        <AppIcon
          icon={icon}
          size={18}
        />
      ) : null}
      {label}
    </>
  );

  if (href) {
    return (
      <Button
        asChild
        onClick={onClick}
        size='lg'
        rounded='full'
      >
        <AppLink href={href}>{content}</AppLink>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      size='lg'
      rounded='full'
    >
      {content}
    </Button>
  );
}
