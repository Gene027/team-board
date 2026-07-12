import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import {
  clearStoredSession,
  getStoredAccessToken,
} from "@/features/auth/utils/auth-session";
import type { ApiErrorResponse } from "@/interfaces/api.interface";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (
      error.response?.status === 401 &&
      error.config?.headers?.Authorization &&
      typeof window !== "undefined"
    ) {
      clearStoredSession();
      window.location.assign(ROUTES.login);
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    return message ?? error.response?.data?.error ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
