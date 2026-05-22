"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/tokens";

export function UserAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStorage.isLoggedIn()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
