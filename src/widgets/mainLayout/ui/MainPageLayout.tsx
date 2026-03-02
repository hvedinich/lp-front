import { Box, Flex } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { useAuthGuard } from '@/features/auth';
import { PageSpinner } from '@/shared/ui';
import { SidebarProvider } from '../model/SidebarContext';
import { AppHeader } from './AppHeader';
import { MainSidebar } from './MainSidebar';

interface MainPageLayoutProps {
  children: ReactNode;
}

export function MainPageLayout({ children }: MainPageLayoutProps) {
  const { isCheckingAuth } = useAuthGuard();

  if (isCheckingAuth) {
    return <PageSpinner />;
  }

  return (
    <SidebarProvider>
      <Flex
        h='dvh100'
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
            minH='zero'
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
