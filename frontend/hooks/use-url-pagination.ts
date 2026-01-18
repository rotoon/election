"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface URLPaginationState {
  page: number;
  limit: number;
  filters: Record<string, string>;
}

export interface URLPaginationActions {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
}

export interface UseURLPaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  filterKeys?: string[];
}

/**
 * Reusable hook for URL-based pagination and filtering.
 * Syncs pagination state with URL search params.
 *
 * Usage:
 * const { state, actions } = useURLPagination({
 *   defaultLimit: 10,
 *   filterKeys: ['province', 'status']
 * })
 */
export function useURLPagination(options: UseURLPaginationOptions = {}) {
  const { defaultPage = 1, defaultLimit = 10, filterKeys = [] } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse state from URL
  const state = useMemo<URLPaginationState>(() => {
    const page = parseInt(searchParams.get("page") || String(defaultPage), 10);
    const limit = parseInt(
      searchParams.get("limit") || String(defaultLimit),
      10
    );

    const filters: Record<string, string> = {};
    filterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        filters[key] = value;
      }
    });

    return { page, limit, filters };
  }, [searchParams, defaultPage, defaultLimit, filterKeys]);

  // Helper to update URL
  const updateURL = useCallback(
    (updates: Partial<URLPaginationState>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.page !== undefined) {
        params.set("page", String(updates.page));
      }

      if (updates.limit !== undefined) {
        params.set("limit", String(updates.limit));
      }

      if (updates.filters !== undefined) {
        // Clear old filters first
        filterKeys.forEach((key) => params.delete(key));
        // Set new filters
        Object.entries(updates.filters).forEach(([key, value]) => {
          if (value && value !== "all") {
            params.set(key, value);
          }
        });
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams, filterKeys]
  );

  // Actions
  const actions = useMemo<URLPaginationActions>(
    () => ({
      setPage: (page: number) => updateURL({ page }),
      setLimit: (limit: number) => updateURL({ page: 1, limit }),
      setFilter: (key: string, value: string) => {
        const newFilters = { ...state.filters, [key]: value };
        updateURL({ page: 1, filters: newFilters });
      },
      resetFilters: () => {
        const emptyFilters: Record<string, string> = {};
        updateURL({ page: 1, filters: emptyFilters });
      },
    }),
    [updateURL, state.filters]
  );

  return { state, actions };
}
