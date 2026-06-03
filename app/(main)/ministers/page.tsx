"use client";

import { useEffect, useState, useMemo } from "react";
import { ministers as ministersApi, followMinister, unfollowMinister, getMyFollowing } from "@/lib/api/ministers";
import { useToast } from "@/hooks/useToast";
import type { Minister, Follow } from "@/lib/api/types";

const PAGE_SIZE = 12;

export default function MinistersPage() {
  const { showToast } = useToast();
  const [allMinisters, setAllMinisters] = useState<Minister[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ministersApi.list(), getMyFollowing()])
      .then(([m, f]) => { setAllMinisters(m); setFollowing(f); })
      .catch(() => showToast("Failed to load ministers.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const followingIds = useMemo(() => new Set(following.map((f) => f.minister.id)), [following]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    setPage(1);
    if (!q) return allMinisters;
    return allMinisters.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.dept.toLowerCase().includes(q) ||
        m.tag.toLowerCase().includes(q),
    );
  }, [allMinisters, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleFollow(m: Minister) {
    const follow = await followMinister(m.id).catch(() => null);
    if (follow) setFollowing((prev) => [...prev, follow]);
    else showToast("Failed to follow.", "error");
  }

  async function handleUnfollow(id: number) {
    await unfollowMinister(id).catch(() => showToast("Failed to unfollow.", "error"));
    setFollowing((prev) => prev.filter((f) => f.minister.id !== id));
  }

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C92A2A]/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C92A2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22V8l9-6 9 6v14" /><path d="M9 22V12h6v10" /><path d="M3 8h18" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ministers</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Connect with Kerala's Ministers. Tag them in issues to get attention.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 md:shrink-0 md:max-w-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="text-xs text-amber-800 leading-relaxed">
            Tag the right minister or department to ensure your issue reaches the right desk.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-sm font-semibold text-gray-800 shrink-0">{allMinisters.length} Ministers</span>
          <span className="text-sm text-gray-400 truncate">· Working for Kerala</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 shrink-0 ml-4">
          <span>Tip: Tag relevant ministers in your posts for faster response</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, department, or tag…"
        className="border border-gray-300 rounded px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C92A2A]/30 w-full"
      />

      {/* Grid */}
      {paginated.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">No ministers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((m) => (
            <MinisterCard
              key={m.id}
              minister={m}
              isFollowing={followingIds.has(m.id)}
              onFollow={() => handleFollow(m)}
              onUnfollow={() => handleUnfollow(m.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination current={page} total={totalPages} onChange={setPage} />
      )}
    </div>
  );
}

function MinisterCard({
  minister: m,
  isFollowing,
  onFollow,
  onUnfollow,
}: {
  minister: Minister;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
      {/* Avatar + info */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {m.avatar_url ? (
            <img
              src={m.avatar_url}
              alt={m.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#C92A2A]/10 flex items-center justify-center">
              <span className="text-xl font-bold text-[#C92A2A]">
                {m.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          {/* Verified badge */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#C92A2A] rounded-full flex items-center justify-center border-2 border-white">
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
          <p className="text-xs text-gray-500 truncate">{m.dept}</p>
          <p className="text-xs text-[#C92A2A] truncate">{m.tag}</p>
        </div>
      </div>

      {/* Follow button */}
      <button
        onClick={isFollowing ? onUnfollow : onFollow}
        className={`w-full py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isFollowing
            ? "border border-gray-300 text-gray-600 hover:bg-gray-50"
            : "bg-[#C92A2A] text-white hover:bg-[#a82323]"
        }`}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </button>

      {/* Divider + Total Tagged */}
      <div className="border-t border-gray-100 pt-2 flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        </svg>
        <span className="text-xs text-gray-400">
          <span className="font-medium text-gray-600">{m.total_posts}</span> Total Tagged
        </span>
      </div>
    </div>
  );
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages: (number | "…")[] = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  const btnBase = "px-3 py-1.5 rounded-lg text-sm transition-colors";
  const active = `${btnBase} bg-[#C92A2A] text-white font-medium`;
  const inactive = `${btnBase} text-gray-600 hover:bg-gray-100`;
  const disabled = `${btnBase} text-gray-300 cursor-not-allowed`;

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={current === 1 ? disabled : inactive}
      >
        ‹ Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={p === current ? active : inactive}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={current === total ? disabled : inactive}
      >
        Next ›
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#C92A2A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
