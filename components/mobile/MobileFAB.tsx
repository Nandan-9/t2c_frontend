"use client";

import { Plus } from "lucide-react";

interface MobileFABProps {
  onClick: () => void;
}

export function MobileFAB({ onClick }: MobileFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[76px] right-4 z-50 w-14 h-14 rounded-full bg-[#C92A2A] hover:bg-[#a82323] text-white shadow-lg flex items-center justify-center transition-colors"
      aria-label="New post"
    >
      <Plus size={24} />
    </button>
  );
}
