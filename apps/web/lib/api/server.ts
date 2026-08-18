import { auth } from "@clerk/nextjs/server";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_URL = `${BASE}/api/v1`;

class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  serverSide = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (serverSide) {
    const authHeaders = await getAuthHeader();
    Object.assign(headers, authHeaders);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.error?.code || "ERROR",
      json.error?.message || "Request failed",
      res.status,
    );
  }

  return json.data as T;
}

export const serverApi = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }, true),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, true),
};

export { ApiError };
export default request;
