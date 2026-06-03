"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { House, Users, Building2, FileText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/home", label: "Home", Icon: House },
  { href: "/following", label: "Following", Icon: Users },
  { href: "/ministers", label: "Ministers", Icon: Building2 },
  { href: "/my-posts", label: "My Posts", Icon: FileText },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-40 flex items-center">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
              active ? "text-[#C92A2A]" : "text-gray-400"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
