import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { UiStoreProvider } from '@/application/providers';
import { getPreferredLanguage, setAppLanguage, system } from '@/shared/config';
import { useDvh } from '@/shared/hooks';
import { AppToaster } from '@/shared/ui';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
  useDvh();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            // Infrastructure-level hook for observability only (no UI side-effects here).
            void error;
          },
        }),
        queryCache: new QueryCache({
          onError: (error) => {
            // Infrastructure-level hook for observability only (no UI side-effects here).
            void error;
          },
        }),
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

  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);

  return (
    <ChakraProvider value={system}>
      <ThemeProvider
        attribute='class'
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <UiStoreProvider>
            {getLayout(<Component {...pageProps} />)}
            <AppToaster />
          </UiStoreProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}

export default App;
