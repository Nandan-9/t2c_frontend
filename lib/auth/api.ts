import { API_BASE_URL } from "./config";
import type { AdminAuthTokens, AdminLoginPayload, AuthTokens, GoogleAuthPayload, GoogleCallbackPayload, RegularUser, UserAuthTokens } from "./types";
import { tokenStorage } from "./tokens";

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function exchangeGoogleCode(payload: GoogleCallbackPayload): Promise<UserAuthTokens> {
  return post<UserAuthTokens>("/auth/google/", payload);
}

export async function refreshAccessToken(): Promise<{ access_token: string }> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) throw new Error("No refresh token");
  return post<{ access_token: string }>("/auth/token/refresh/", { refresh_token: refresh });
}

export async function logout(): Promise<void> {
  const access = tokenStorage.getAccess();
  const refresh = tokenStorage.getRefresh();
  if (!refresh || !access) return;

  await post("/auth/logout/", { refresh_token: refresh }, access).catch(() => {});
  tokenStorage.clear();
}

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminAuthTokens> {
  const tokens = await post<AdminAuthTokens>("/auth/admin/login/", payload);
  tokenStorage.save(tokens);
  return tokens;
}

export async function adminLogout(): Promise<void> {
  const access = tokenStorage.getAccess();
  const refresh = tokenStorage.getRefresh();
  if (!refresh || !access) return;

  await post("/auth/admin/logout/", { refresh_token: refresh }, access).catch(() => {});
  tokenStorage.clear();
}

export async function googleLogin(payload: GoogleAuthPayload): Promise<UserAuthTokens> {
  const tokens = await post<UserAuthTokens>("/auth/google/", payload);
  tokenStorage.save(tokens);
  return tokens;
}

export async function userLogout(): Promise<void> {
  const access = tokenStorage.getAccess();
  const refresh = tokenStorage.getRefresh();
  if (!refresh || !access) return;

  await post("/auth/logout/", { refresh_token: refresh }, access).catch(() => {});
  tokenStorage.clear();
}

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
  const res = await fetch(
    `${API_BASE_URL}/users/me/username/check/?username=${encodeURIComponent(username)}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<{ available: boolean }>;
}

export async function setUsername(username: string): Promise<RegularUser> {
  const access = tokenStorage.getAccess();
  const res = await fetch(`${API_BASE_URL}/users/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: JSON.stringify({ username }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const usernameErrors = (data as { username?: string[] }).username;
    throw new Error(usernameErrors?.[0] ?? `Request failed: ${res.status}`);
  }
  return data as RegularUser;
}
