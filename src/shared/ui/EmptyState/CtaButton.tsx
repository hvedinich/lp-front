import { Button } from '@chakra-ui/react';
import { AppLink } from '../AppLink';
import { AppIcon } from '../icons';
import type { EmptyStateCta } from './types';

export function EmptyStateCtaButton({ href, icon, label, onClick }: EmptyStateCta) {
  const content = (
    <Button
      onClick={onClick}
      size='lg'
      rounded='full'
    >
      {icon ? (
        <AppIcon
          icon={icon}
          size={18}
        />
      ) : null}
      {label}
    </Button>
  );

  if (href) {
    return (
      <AppLink
        href={href}
        _hover={{ textDecoration: 'none' }}
      >
        {content}
      </AppLink>
    );
  }

  return content;
}
