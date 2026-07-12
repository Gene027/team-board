"use client";

import { useSyncExternalStore } from "react";
import { getStoredAccessToken } from "@/features/auth/utils/auth-session";

export function useStoredAccessToken() {
  return useSyncExternalStore(subscribeToStorage, getStoredAccessToken, () => undefined);
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}
