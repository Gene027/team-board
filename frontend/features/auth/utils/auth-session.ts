import { tokenService } from "@/services/token.service";

export const authQueryKeys = {
  profile: ["auth", "profile"] as const,
};

export function getStoredAccessToken() {
  return tokenService.getStoredToken();
}

export function clearStoredSession() {
  tokenService.clearSession();
}
