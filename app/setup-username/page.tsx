"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/tokens";
import { checkUsernameAvailability, setUsername } from "@/lib/auth/api";
import { ROUTES } from "@/lib/auth/config";
import type { RegularUser } from "@/lib/auth/types";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

type AvailabilityState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SetupUsernamePage() {
  const router = useRouter();

  const [value, setValue] = useState("");
  const [availability, setAvailability] = useState<AvailabilityState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!tokenStorage.isLoggedIn()) {
      router.replace(ROUTES.login);
      return;
    }
    const user = tokenStorage.getUser() as RegularUser | null;
    if (user?.username) setValue(user.username);
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    setSubmitError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!v) {
      setAvailability("idle");
      return;
    }

    if (!USERNAME_RE.test(v)) {
      setAvailability("invalid");
      return;
    }

    setAvailability("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const { available } = await checkUsernameAvailability(v);
        setAvailability(available ? "available" : "taken");
      } catch {
        setAvailability("idle");
      }
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (availability !== "available" || submitting) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const updatedUser = await setUsername(value);
      tokenStorage.save({
        access_token: tokenStorage.getAccess()!,
        refresh_token: tokenStorage.getRefresh()!,
        user: updatedUser,
      });
      router.replace(ROUTES.home);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  const canSubmit = availability === "available" && !submitting;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-900">Choose your username</h1>
          <p className="text-sm text-gray-500">
            Pick a handle for your account. You can change it later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="e.g. john_doe"
                maxLength={30}
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 focus:border-[#4F46E5]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base leading-none">
                <StatusIcon state={availability} />
              </span>
            </div>

            <StatusMessage state={availability} />

            {submitError && (
              <p className="text-xs text-red-600">{submitError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-[#4F46E5] text-white rounded-full py-2.5 text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}

function StatusIcon({ state }: { state: AvailabilityState }) {
  if (state === "checking") return <span className="text-gray-400 text-xs animate-pulse">...</span>;
  if (state === "available") return <span className="text-green-500">✓</span>;
  if (state === "taken") return <span className="text-red-500">✗</span>;
  if (state === "invalid") return <span className="text-red-500">✗</span>;
  return null;
}

function StatusMessage({ state }: { state: AvailabilityState }) {
  if (state === "available") {
    return <p className="text-xs text-green-600">Username is available</p>;
  }
  if (state === "taken") {
    return <p className="text-xs text-red-600">Username is already taken</p>;
  }
  if (state === "invalid") {
    return (
      <p className="text-xs text-red-600">
        3–30 characters, letters, digits, and underscores only
      </p>
    );
  }
  return (
    <p className="text-xs text-gray-400">
      3–30 characters · letters, digits, and underscores only
    </p>
  );
}
