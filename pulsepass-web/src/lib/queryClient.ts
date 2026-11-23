import { QueryClient } from '@tanstack/react-query';

/** retry:false → un 404 o un 409 se muestran de inmediato, sin reintentos silenciosos. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 },
    mutations: { retry: false },
  },
});
