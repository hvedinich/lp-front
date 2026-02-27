import { Box, Center, Flex, Spinner } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { useAuthGuard } from '../model/useAuthGuard';
import { SidebarProvider } from '../model/SidebarContext';
import { AppHeader } from './AppHeader';
import { MainSidebar } from './MainSidebar';

interface MainPageLayoutProps {
  children: ReactNode;
}

export function MainPageLayout({ children }: MainPageLayoutProps) {
  const { isCheckingAuth } = useAuthGuard();

  if (isCheckingAuth) {
    return (
      <Center
        minH='dvh'
        width='full'
      >
        <Spinner size='lg' />
      </Center>
    );
  }

  return (
    <SidebarProvider>
      <Flex
        h='dvh'
        overflow='hidden'
        bg='bg.canvas'
      >
        <MainSidebar />

        {/* Main content column: sticky header + scrollable body */}
        <Flex
          flex='1'
          flexDirection='column'
          overflow='hidden'
        >
          <AppHeader />
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
      </Flex>
    </SidebarProvider>
  );
}
