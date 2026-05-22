"use client";

import { useEffect, useState } from "react";
import { getMyFollowing, unfollowMinister } from "@/lib/api/ministers";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import { MinisterBadge } from "@/components/ui/MinisterBadge";
import { useToast } from "@/hooks/useToast";
import type { Follow } from "@/lib/api/types";

export default function FollowingPage() {
  const { showToast } = useToast();
  const [following, setFollowing] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyFollowing()
      .then(setFollowing)
      .catch(() => showToast("Failed to load.", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleUnfollow(id: number) {
    await unfollowMinister(id).catch(() => showToast("Failed to unfollow.", "error"));
    setFollowing((prev) => prev.filter((f) => f.minister.id !== id));
  }

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-gray-800">Following</h1>
      {following.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">You're not following any ministers yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {following.map((f) => {
            const m = f.minister;
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
                    onClick={() => handleUnfollow(m.id)}
                    className="text-xs text-gray-600 border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-50"
                  >
                    Unfollow
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
