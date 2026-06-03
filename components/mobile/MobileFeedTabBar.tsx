"use client";

export type Tab = "all" | "trending" | "latest" | "responded";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "latest", label: "Latest" },
  { id: "responded", label: "Responded" },
];

interface MobileFeedTabBarProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function MobileFeedTabBar({ tab, onTabChange }: MobileFeedTabBarProps) {
  return (
    <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-gray-200 bg-white sticky top-14 z-30">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap shrink-0 relative transition-colors ${
            tab === t.id ? "text-[#C92A2A]" : "text-gray-400"
          }`}
        >
          {t.label}
          {tab === t.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C92A2A] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
