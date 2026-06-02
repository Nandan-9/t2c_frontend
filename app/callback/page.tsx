"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { googleLogin } from "@/lib/auth/api";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const err = searchParams.get("error");

    if (err || !code) {
      router.replace("/login?error=auth_failed");
      return;
    }

    googleLogin({
      code,
      redirect_uri: window.location.origin + "/callback",
    })
      .then(() => router.replace("/home"))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Authentication failed.");
        setTimeout(() => router.replace("/login?error=auth_failed"), 2000);
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-sm">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#C92A2A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
