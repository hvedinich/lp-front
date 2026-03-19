import { Box, Flex, Grid, Text, chakra, type IconProps } from '@chakra-ui/react';
import type { FC } from 'react';
import type { ContactPlatform } from '@/entities/hostedPage';
import { PLATFORM_ICON, getPlatformLabel } from '@/shared/config/platforms';

interface PlatformCardsListProps {
  title: string;
  platforms: ContactPlatform[];
  togglePlatform: (platform: ContactPlatform) => void;
}

const PlatformCardsList = ({ title, platforms, togglePlatform }: PlatformCardsListProps) => (
  <Box>
    <Text
      fontWeight='semibold'
      mb='2'
      fontSize='sm'
      color='fg.muted'
    >
      {title}
    </Text>
    <Grid
      templateColumns='repeat(auto-fill, minmax(130px, 1fr))'
      gap='2'
    >
      {platforms?.map((platform) => {
        const PlatformIcon: FC<IconProps> = PLATFORM_ICON[platform];

        return (
          <chakra.button
            type='button'
            key={platform}
            onClick={() => togglePlatform(platform)}
            cursor='button'
          >
            <Flex layerStyle='focusBox'>
              <PlatformIcon boxSize={5} />
              <Text fontSize='sm'>{getPlatformLabel(platform)}</Text>
            </Flex>
          </chakra.button>
        );
      })}
    </Grid>
  </Box>
);

export default PlatformCardsList;
