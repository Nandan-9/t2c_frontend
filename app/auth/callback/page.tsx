"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeGoogleCode } from "@/lib/auth/api";
import { tokenStorage } from "@/lib/auth/tokens";
import { ROUTES } from "@/lib/auth/config";

type Status = "loading" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      setErrorMsg(error === "access_denied" ? "Login was cancelled." : "Authentication failed.");
      setStatus("error");
      return;
    }

    exchangeGoogleCode({
      code,
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI ?? "",
    })
      .then((tokens) => {
        tokenStorage.save(tokens);
        router.replace(tokens.is_new_user ? ROUTES.setupUsername : ROUTES.home);
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
        setStatus("error");
      });
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-medium">{errorMsg}</p>
        <a href={ROUTES.login} className="text-blue-600 underline text-sm">
          Back to login
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-gray-500 text-sm">Signing you in…</p>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
      />
    </svg>
  );
}
