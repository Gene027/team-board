"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { AuthResponse, User } from "@/interfaces/auth.interface";
import { tokenService } from "@/services/token.service";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setSession: (session: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const rawSession = useSyncExternalStore(
    subscribeToSession,
    tokenService.getRawSession,
    () => null,
  );
  const session = useMemo(
    () => tokenService.parseSession(rawSession),
    [rawSession],
  );

  const logout = useCallback(() => {
    tokenService.clearSession();
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener("teamboard:unauthorized", logout);
    return () => window.removeEventListener("teamboard:unauthorized", logout);
  }, [logout]);

  const setSession = useCallback((nextSession: AuthResponse) => {
    tokenService.setSession(nextSession);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isHydrating: !hasHydrated,
      setSession,
      logout,
    }),
    [hasHydrated, logout, session, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function subscribeToHydration() {
  return () => undefined;
}

function subscribeToSession(callback: () => void) {
  window.addEventListener("teamboard:session-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("teamboard:session-change", callback);
    window.removeEventListener("storage", callback);
  };
}
