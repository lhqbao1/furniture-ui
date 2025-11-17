// app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { tokenStore } from "@/lib/token";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  useEffect(() => {
    tokenStore.hydrateFromStorage();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
