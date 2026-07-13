"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ROUTES } from "@/constants/routes";
import {
  authQueryKeys,
  clearStoredSession,
} from "@/features/auth/utils/auth-session";
import { notifySuccess } from "@/lib/toast";
import { authService } from "@/services/auth.service";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const profileQuery = useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: authService.getProfile,
    retry: false,
  });

  const logout = useCallback(() => {
    clearStoredSession();
    queryClient.clear();
    notifySuccess("Signed out.");
    router.replace(ROUTES.login);
  }, [queryClient, router]);

  return {
    user: profileQuery.data ?? null,
    isAuthenticated: Boolean(profileQuery.data),
    profileQuery,
    logout,
  };
}
