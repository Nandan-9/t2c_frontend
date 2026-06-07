"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import type { RegularUser } from "@/lib/auth/types";

interface MobileHeaderProps {
  user: RegularUser | null;
  onLogout: () => void;
  onLoginPrompt: () => void;
  className?: string;
}

export function MobileHeader({ user, onLogout, onLoginPrompt, className }: MobileHeaderProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className={`h-14 bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center justify-between px-4 shrink-0 ${className ?? ""}`}>
      <Image src="/logos/logo_1.svg" alt="Logo" width={80} height={40} className="object-contain" />

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-lg px-5 py-4 w-48 text-sm text-gray-500 text-center z-50">
              Coming soon
            </div>
          )}
        </div>

        {/* User menu or Login */}
        {user ? (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <AvatarCircle
                avatar_url={"avatar_url" in user ? user.avatar_url : null}
                username={user.username}
                size="sm"
              />
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 z-50">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={15} className="text-gray-400" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLoginPrompt}
            className="bg-[#C92A2A] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#a82323] transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
