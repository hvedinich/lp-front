import { Box, Card, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { AppLink } from '../AppLink';
import { AppIcon } from '../icons';
import type { EmptyStateAction } from './types';

export function EmptyStateActionCard({ action }: { action: EmptyStateAction }) {
  const content = (
    <Card.Root variant='outlineClickable'>
      <Card.Body p='4'>
        <HStack
          align='start'
          gap='4'
          textAlign='left'
        >
          {action.icon ? (
            <Box pt='1'>
              <AppIcon
                icon={action.icon}
                size={22}
              />
            </Box>
          ) : null}

          <Stack gap='1'>
            <Heading size='sm'>{action.title}</Heading>
            {action.description ? <Text color='fg.muted'>{action.description}</Text> : null}
          </Stack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );

  if ('href' in action && action.href) {
    return (
      <AppLink
        href={action.href}
        display='block'
        textDecoration='none'
        _hover={{ textDecoration: 'none' }}
      >
        {content}
      </AppLink>
    );
  }

  return (
    <Box
      as='button'
      onClick={action.onClick}
      w='full'
    >
      {content}
    </Box>
  );
}
