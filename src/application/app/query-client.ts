import { isServer, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
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
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
}
