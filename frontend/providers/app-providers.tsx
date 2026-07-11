"use client";

import { AuthProvider } from "@/features/auth/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
