"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { tokenStorage } from "./tokens";
import { GOOGLE_AUTH_URL } from "./config";
import type { RegularUser } from "./types";

interface AuthContextValue {
  user: RegularUser | null;
  isLoggedIn: boolean;
  showLoginPrompt: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  showLoginPrompt: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RegularUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setUser(tokenStorage.getUser() as RegularUser | null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, showLoginPrompt: () => setModalOpen(true) }}>
      {children}
      {modalOpen && <LoginPromptModal onClose={() => setModalOpen(false)} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function LoginPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center gap-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="w-14 h-14 rounded-full bg-[#2D2FA3] flex items-center justify-center shrink-0">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l19-9-9 19-2-8-8-2z" />
          </svg>
        </div>

        <div className="text-center flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900">Join the conversation</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Sign in to vote, comment, and raise issues that matter to Kerala.
          </p>
        </div>

        <a
          href={GOOGLE_AUTH_URL}
          className="flex items-center gap-3 w-full justify-center px-5 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </a>

        <p className="text-xs text-gray-400 text-center">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
