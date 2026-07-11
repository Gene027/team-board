import { STORAGE_KEYS } from "@/constants/storage";
import type { AuthSession } from "@/interfaces/auth.interface";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export const tokenService = {
  getRawSession(): string | null {
    if (!canUseStorage()) {
      return null;
    }

    return window.localStorage.getItem(STORAGE_KEYS.authSession);
  },

  parseSession(rawSession: string | null): AuthSession | null {
    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      this.clearSession();
      return null;
    }
  },

  getSession(): AuthSession | null {
    return this.parseSession(this.getRawSession());
  },

  setSession(session: AuthSession) {
    if (canUseStorage()) {
      window.localStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));
      window.dispatchEvent(new Event("teamboard:session-change"));
    }
  },

  clearSession() {
    if (canUseStorage()) {
      window.localStorage.removeItem(STORAGE_KEYS.authSession);
      window.dispatchEvent(new Event("teamboard:session-change"));
    }
  },

  getAccessToken() {
    return this.getSession()?.accessToken ?? null;
  },
};
