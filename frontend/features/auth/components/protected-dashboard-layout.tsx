"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useStoredAccessToken } from "@/features/auth/hooks/use-stored-access-token";
import { authQueryKeys } from "@/features/auth/utils/auth-session";
import { authService } from "@/services/auth.service";

interface ProtectedDashboardLayoutProps {
  children: React.ReactNode;
}

export function ProtectedDashboardLayout({
  children,
}: ProtectedDashboardLayoutProps) {
  const router = useRouter();
  const token = useStoredAccessToken();

  const profileQuery = useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: authService.getProfile,
    enabled: typeof token === "string",
    retry: false,
  });

  useEffect(() => {
    if (token === null) {
      router.replace(ROUTES.login);
    }
  }, [router, token]);

  if (token === undefined || (token && profileQuery.isLoading)) {
    return <AuthLoader />;
  }

  if (!token || !profileQuery.data) {
    return null;
  }

  return children;
}

function AuthLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <span className="size-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
        <span className="text-sm font-semibold text-slate-700">
          Loading workspace
        </span>
      </div>
    </main>
  );
}
