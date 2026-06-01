"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/tokens";
import { GOOGLE_AUTH_URL } from "@/lib/auth/config";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (tokenStorage.isLoggedIn()) router.replace("/home");
  }, [router]);

  return (
    <main className="min-h-screen w-full flex items-center bg-[#f5f5f0]">
      {/* Left content */}
      <div className="relative flex-1 flex flex-col justify-center px-12 lg:px-20 py-16 max-w-2xl min-h-screen">

        {/* Brand */}
        <div className="flex items-center gap-2 mb-14">
          <div className="w-8 h-8 rounded-full bg-[#2D2FA3] flex items-center justify-center">
            <MegaphoneIcon size={16} />
          </div>
          <span className="text-sm font-bold tracking-widest text-[#2D2FA3] uppercase">
            Keralam Speaks
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-extrabold text-[#1a1a2e] leading-tight mb-1">
          Your Voice.
        </h1>
        <h1 className="text-5xl font-extrabold text-[#2D2FA3] leading-tight mb-4">
          Stronger Together.
        </h1>
        <div className="w-12 h-1 bg-[#2D2FA3] rounded mb-6" />

        <p className="text-[#4a4a6a] text-base leading-relaxed mb-12">
          Speak up. Share real issues.
          <br />
          Let&apos;s build a better Kerala, together.
        </p>

        {/* Feature icons */}
        <div className="flex items-start gap-10">
          <FeatureItem icon={<ChatIcon />} label="Share" sub="Problems" />
          <FeatureItem icon={<TrendIcon />} label="Upvote" sub="What Matters" />
          <FeatureItem icon={<GovIcon />} label="Voice to" sub="Government" />
        </div>
      </div>

      {/* Right card */}
      <div className="flex-1 flex items-center justify-center py-16">
        <div className=" p-10 flex flex-col items-center gap-5 w-full max-w-xs">
          <div className="w-16 h-16 rounded-full bg-[#2D2FA3] flex items-center justify-center">
            <MegaphoneIcon size={28} />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Keralam Speaks</h2>
            <p className="text-sm text-gray-400 mt-1">Speak. Support. Strengthen Kerala.</p>
          </div>

          <a
            href={GOOGLE_AUTH_URL}
            className="flex items-center gap-3 w-full justify-center px-5 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors mt-2"
          >
            <GoogleIcon />
            Continue with Google
          </a>
        </div>
      </div>
    </main>
  );
}

function FeatureItem({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-[#4a4a6a] mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-semibold text-[#1a1a2e]">{label}</div>
        <div className="text-xs text-[#4a4a6a]">{sub}</div>
      </div>
    </div>
  );
}

function MegaphoneIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function GovIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" />
      <rect x="3" y="14" width="4" height="8" />
      <rect x="10" y="10" width="4" height="12" />
      <rect x="17" y="6" width="4" height="16" />
      <path d="M2 14l10-9 10 9" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
