"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center px-4 font-[family-name:--font-poppins]">
        <div className="flex flex-col items-center gap-8 text-center">
          <Image src="/logos/logo_1.svg" alt="Logo" width={120} height={60} className="object-contain" />

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-sm text-gray-500 max-w-xs">
              An unexpected error occurred. You can try again or go back to the home page.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="border border-gray-300 text-gray-700 rounded px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-[#C92A2A] text-white rounded px-5 py-2.5 text-sm font-medium hover:bg-[#a82323] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
