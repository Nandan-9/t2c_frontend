"use client";

import { useState, useEffect, useCallback } from "react";
import { tokenStorage } from "@/lib/auth/tokens";
import { logout as apiLogout, refreshAccessToken } from "@/lib/auth/api";
import type { AdminUser, AuthUser, RegularUser } from "@/lib/auth/types";

interface AuthState {
  user: AuthUser | AdminUser | RegularUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    isLoading: true,
  });

  useEffect(() => {
    setState({
      user: tokenStorage.getUser(),
      isLoggedIn: tokenStorage.isLoggedIn(),
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ user: null, isLoggedIn: false, isLoading: false });
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const { access_token } = await refreshAccessToken();
      localStorage.setItem("auth_access_token", access_token);
    } catch {
      await logout();
    }
  }, [logout]);

  return { ...state, logout, refreshToken };
}
