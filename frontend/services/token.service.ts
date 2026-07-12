import { STORAGE_KEYS } from "@/constants/storage";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export const tokenService = {
  getSession() {
    return this.getStoredToken();
  },

  clearSession() {
    this.removeToken();
  },

  getStoredToken(): string | null {
    if (!canUseStorage()) {
      return null;
    }

    return window.localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  setToken(accessToken: string) {
    if (canUseStorage()) {
      window.localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    }
  },

  removeToken() {
    if (canUseStorage()) {
      window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    }
  },
};
