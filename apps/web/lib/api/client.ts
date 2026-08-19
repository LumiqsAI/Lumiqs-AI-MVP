"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_URL = `${BASE}/api/v1`;

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
  }
}

export function useApiClient() {
  const { getToken } = useAuth();

  const request = useCallback(
    async <T>(path: string, options: RequestInit = {}): Promise<T> => {
      const token = await getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}${path}`, { ...options, headers });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new ApiError(
          json.error?.code || "ERROR",
          json.error?.message || "Request failed",
          res.status,
        );
      }
      return json.data as T;
    },
    [getToken],
  );

  return useMemo(
    () => ({
      get: <T>(path: string) => request<T>(path, { method: "GET" }),
      post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body) }),
      patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
      delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
      getToken,
    }),
    [getToken, request],
  );
}
