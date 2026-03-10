import { Center, Heading, Separator, Stack, Text } from '@chakra-ui/react';
import { EmptyStateActionCard } from './ActionCard';
import { EmptyStateCtaButton } from './CtaButton';
import { DefaultIllustration } from './DefaultIllustration';
import type { EmptyStateProps } from './types';

export default function EmptyState({
  actionCards,
  actionsTitle,
  cta,
  description,
  illustration,
  title,
  ...rootProps
}: EmptyStateProps) {
  const hasActions = Boolean(cta || actionCards?.length);

  return (
    <Center
      minH='64'
      h='full'
      w='full'
      {...rootProps}
    >
      <Stack
        align='center'
        gap='5'
        textAlign='center'
        w='full'
        maxW='2xl'
      >
        {illustration === undefined ? <DefaultIllustration /> : illustration}

        <Stack
          gap='2'
          maxW='lg'
        >
          <Heading size='lg'>{title}</Heading>
          <Text color='fg.muted'>{description}</Text>
        </Stack>

        {hasActions ? (
          <Stack
            align='stretch'
            gap='4'
            pt='2'
            w='full'
            maxW='xl'
          >
            <Separator />

            <Stack
              align='center'
              gap='4'
            >
              {actionsTitle ? <Heading size='md'>{actionsTitle}</Heading> : null}
              {cta ? <EmptyStateCtaButton {...cta} /> : null}
            </Stack>

            {actionCards?.length ? (
              <Stack gap='3'>
                {actionCards.map((action) => (
                  <EmptyStateActionCard
                    key={`${action.title}-${action.description ?? ''}`}
                    action={action}
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Center>
  );
}
