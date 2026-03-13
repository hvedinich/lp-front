import { Card, CardRootProps, Flex, FlexProps } from '@chakra-ui/react';
import { AppBrand } from '@/shared/ui';
import { FC } from 'react';

type AuthPageLayoutProps = {
  childrenProps?: Omit<CardRootProps, 'bg'>;
} & Omit<FlexProps, 'bg'>;

export const AuthPageLayout: FC<AuthPageLayoutProps> = ({ children, childrenProps, ...props }) => (
  <Flex
    minH='dvh100'
    align='center'
    direction='column'
    p='6'
    gap='6'
    bg='bg.gradient.hero'
    {...props}
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
        {...childrenProps}
      >
        {children}
      </Card.Root>
    </Flex>
  </Flex>
);
