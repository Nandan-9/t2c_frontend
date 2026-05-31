import { API_BASE_URL } from "@/lib/auth/config";
import { tokenStorage } from "@/lib/auth/tokens";
import { refreshAccessToken } from "@/lib/auth/api";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  body?: unknown;
  auth?: boolean; // default: true
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Singleton so concurrent 401s share one refresh call instead of each firing their own.
// Rotating refresh tokens would be invalidated by the second attempt, causing a spurious logout.
let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken()
    .then(({ access_token }) => {
      tokenStorage.save({
        access_token,
        refresh_token: tokenStorage.getRefresh()!,
        user: tokenStorage.getUser()!,
      });
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function doFetch(
  method: Method,
  path: string,
  body: unknown,
  auth: boolean,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStorage.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiRequest<T>(
  method: Method,
  path: string,
  { body, auth = true }: RequestOptions = {},
): Promise<T> {
  let res = await doFetch(method, path, body, auth);

  if (auth && res.status === 401) {
    try {
      await doRefresh();
      res = await doFetch(method, path, body, auth);
    } catch {
      tokenStorage.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new ApiError(401, "Session expired. Please log in again.");
    }
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      (data as { detail?: string }).detail ??
      `Request failed: ${res.status}`;
    throw new ApiError(res.status, detail);
  }

  return data as T;
}
