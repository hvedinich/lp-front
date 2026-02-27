import { Box, Center, Flex, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { type ReactNode } from 'react';
import { isPublicRoute } from '@/shared/config';
import { useAuthGuard } from '@/shared/hooks';
import { MainSidebar } from './MainSidebar';

interface MainPageLayoutProps {
  children: ReactNode;
}

export function MainPageLayout({ children }: MainPageLayoutProps) {
  const router = useRouter();
  const { isCheckingAuth } = useAuthGuard();
  const publicRoute = isPublicRoute(router.pathname);

  if (isCheckingAuth) {
    return (
      <Center
        minH='[100dvh]'
        width='full'
      >
        <Spinner size='lg' />
      </Center>
    );
  }

  if (publicRoute) {
    return <Box minH='[100dvh]'>{children}</Box>;
  }

  return (
    <Flex
      h='[100dvh]'
      direction={{ base: 'column', md: 'row' }}
      bg='bg.subtle'
      overflow='hidden'
    >
      <MainSidebar />
      <Box
        as='main'
        flex='1'
        minH='[0]'
        overflowY='auto'
        p={{ base: '4', md: '8' }}
      >
        {children}
      </Box>
    </Flex>
  );
}
