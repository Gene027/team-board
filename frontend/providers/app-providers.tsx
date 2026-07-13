"use client";

import { QueryProvider } from "@/providers/query-provider";
import { ToastContainer } from "react-toastify";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      {children}
      <ToastContainer
        autoClose={4500}
        closeOnClick
        draggable
        newestOnTop
        pauseOnFocusLoss
        pauseOnHover
        position="top-right"
        theme="light"
      />
    </QueryProvider>
  );
}
