"use client";

import { AuthCard } from "@/features/auth/components/auth-card";
import { ProjectDashboard } from "@/features/projects/components/project-dashboard";
import { useAuth } from "@/hooks/use-auth";

export function HomeScreen() {
  const { isAuthenticated, isHydrating } = useAuth();

  if (isHydrating) {
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

  return isAuthenticated ? <ProjectDashboard /> : <AuthCard />;
}
