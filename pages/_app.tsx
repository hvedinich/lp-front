import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { getPreferredLanguage, setAppLanguage } from '@/shared/config';
import { MainPageLayout } from '@/widgets/mainLayout';

function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  useEffect(() => {
    void setAppLanguage(getPreferredLanguage());
  }, []);

  return (
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>
        <MainPageLayout>
          <Component {...pageProps} />
        </MainPageLayout>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
