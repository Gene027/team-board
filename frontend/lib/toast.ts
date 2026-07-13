"use client";

import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  isApiRequestTimeoutError,
} from "@/services/api-client";

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyApiError(error: unknown, fallback: string) {
  toast.error(getApiErrorMessage(error, fallback), {
    toastId: isApiRequestTimeoutError(error) ? "api-timeout" : undefined,
  });
}
