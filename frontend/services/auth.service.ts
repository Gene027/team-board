import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
} from "@/interfaces/auth.interface";
import { apiClient } from "@/services/api-client";

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async signup(payload: SignupPayload) {
    const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
    return data;
  },
};
