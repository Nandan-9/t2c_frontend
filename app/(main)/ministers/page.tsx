"use client";

import { useEffect, useState, useMemo } from "react";
import { ministers as ministersApi, followMinister, unfollowMinister, getMyFollowing } from "@/lib/api/ministers";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import { MinisterBadge } from "@/components/ui/MinisterBadge";
import { useToast } from "@/hooks/useToast";
import type { Minister, Follow } from "@/lib/api/types";

export default function MinistersPage() {
  const { showToast } = useToast();
  const [allMinisters, setAllMinisters] = useState<Minister[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [query, setQuery] = useState("");
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
    if (!q) return allMinisters;
    return allMinisters.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.dept.toLowerCase().includes(q) ||
        m.tag.toLowerCase().includes(q),
    );
  }, [allMinisters, query]);

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-800">Ministers</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, dept, tag…"
          className="border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0169CC]/30 w-56"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">No ministers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((m) => {
            const isFollowing = followingIds.has(m.id);
            return (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <AvatarCircle avatar_url={m.avatar_url} username={m.name} size="lg" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                    <p className="text-xs text-gray-500 truncate">{m.dept}</p>
                    <p className="text-xs text-gray-400 truncate">{m.constituency}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <MinisterBadge tag={m.tag} name="" />
                  <button
                    onClick={() => isFollowing ? handleUnfollow(m.id) : handleFollow(m)}
                    className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                      isFollowing
                        ? "text-gray-600 border-gray-300 hover:bg-gray-50"
                        : "text-white bg-[#0169CC] border-[#0169CC] hover:bg-[#0158b0]"
                    }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#0169CC] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
