"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tokenStorage } from "@/lib/auth/tokens";
import { adminLogout } from "@/lib/auth/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }
    if (!tokenStorage.isLoggedIn() || !tokenStorage.isAdmin()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [isLoginPage, router]);

  if (!ready) return null;

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <span className="font-bold text-lg" style={{ color: "#0741E1" }}>
            talk2CM
          </span>
          <p className="text-xs text-gray-400 mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLink href="/admin" label="Ministers" />
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={async () => {
              await adminLogout();
              router.replace("/admin/login");
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <a
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </a>
  );
}
