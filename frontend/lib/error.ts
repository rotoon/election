/**
 * Shared API error handling utilities
 */

import type { ApiError } from "@/types";

export type { ApiError } from "@/types";

/**
 * Extract error message from ApiError
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const apiError = error as ApiError;
    return apiError.response?.data?.message || apiError.message || fallback;
  }
  return fallback;
}
