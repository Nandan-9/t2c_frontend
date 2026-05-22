"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/tokens";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (tokenStorage.isLoggedIn()) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
