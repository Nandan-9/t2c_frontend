import type { AdminUser, AuthUser, RegularUser } from "./types";

const ACCESS_KEY = "auth_access_token";
const REFRESH_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

type StoredUser = AuthUser | AdminUser | RegularUser;

export const tokenStorage = {
  save(tokens: { access_token: string; refresh_token: string; user: StoredUser }) {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
  },

  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },

  getUser(): StoredUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn(): boolean {
    return Boolean(localStorage.getItem(ACCESS_KEY));
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return Boolean(user && "is_staff" in user && user.is_staff);
  },
};
