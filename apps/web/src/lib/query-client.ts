import { QueryClient } from '@tanstack/react-query';

let _queryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (!_queryClient) {
    _queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          retry: false,            // never retry — Firestore errors are not transient
          refetchOnWindowFocus: false, // don't cycle loading states on tab focus
        },
      },
    });
  }
  return _queryClient;
}
