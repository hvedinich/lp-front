import { Card, HStack, Text, Link, CardRootProps } from '@chakra-ui/react';
import { PLATFORM_ICON } from '../lib/constants';
import { Tooltip } from '@/shared/ui';
import { getPlatformLabel } from '../lib/helpers';
import { ContactPlatform } from '@/entities/hostedPage';

interface PlatformCardProps extends CardRootProps {
  platform: ContactPlatform;
  url: string;
}

export function PlatformCard({ platform, url, ...props }: PlatformCardProps) {
  const Icon = PLATFORM_ICON[platform];

  return (
    <Card.Root
      cursor='button'
      h='full'
      overflow='hidden'
      p='4'
      gap='1'
      variant='outline'
      {...props}
    >
      <HStack>
        <Icon boxSize={5} />
        <Text
          fontSize='sm'
          fontWeight='medium'
        >
          {getPlatformLabel(platform)}
        </Text>
      </HStack>

      <Tooltip
        closeDelay={500}
        openDelay={500}
        content={url}
      >
        <Link
          fontSize='xs'
          href={url}
          color='fg.muted'
          target='_blank'
          overflow='hidden'
          textOverflow='ellipsis'
          whiteSpace='nowrap'
        >
          {url}
        </Link>
      </Tooltip>
    </Card.Root>
  );
}
