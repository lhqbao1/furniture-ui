"use client";

import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { useState } from "react";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // optional

interface QueryProviderProps {
  children: React.ReactNode;
  state?: DehydratedState | null;
}

export function QueryProvider({ children, state }: QueryProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // cache 5 phút
            gcTime: 1000 * 60 * 30, // dọn cache sau 30 phút
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
      {/* Optional Devtools */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
