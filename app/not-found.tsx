import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center px-4 font-[family-name:--font-poppins]">
      <div className="flex flex-col items-center gap-8 text-center">
        <Image src="/logos/logo_1.svg" alt="Logo" width={120} height={60} className="object-contain" />

        <div className="flex flex-col gap-2">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="text-lg font-semibold text-gray-700">Page not found</p>
          <p className="text-sm text-gray-500 max-w-xs">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <Link
          href="/"
          className="bg-[#C92A2A] text-white rounded px-6 py-2.5 text-sm font-medium hover:bg-[#a82323] transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
