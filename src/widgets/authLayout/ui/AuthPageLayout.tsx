import { Card, Flex } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { AppBrand } from '@/shared/ui';

interface AuthPageLayoutProps {
  children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <Flex
      minH='dvh'
      align='center'
      direction='column'
      p='6'
      gap='6'
      bg='bg.gradient.hero'
    >
      <AppBrand />
      <Flex
        align='center'
        justify='center'
        flex='1'
        maxW='full'
      >
        <Card.Root
          width='xl'
          maxW='full'
          bg='bg.canvas'
          p={{ base: '6', md: '12' }}
        >
          {children}
        </Card.Root>
      </Flex>
    </Flex>
  );
}
