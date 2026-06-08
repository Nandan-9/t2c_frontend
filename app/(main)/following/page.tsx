"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyFollowing } from "@/lib/api/ministers";
import { posts as postsApi, type Post, type MinistersPage } from "@/lib/api/posts";
import { PostCard } from "@/components/ui/PostCard";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/lib/auth/context";
import type { Follow } from "@/lib/api/types";

type MinistersCursor = {
  cursor_upvote_count?: number;
  cursor_created_at?: string;
  cursor_id: number;
};

function nextCursorFrom(page: MinistersPage): MinistersCursor | null {
  if (page.next_cursor_id == null) return null;
  return {
    cursor_upvote_count: page.next_cursor_upvote_count ?? undefined,
    cursor_created_at: page.next_cursor_created_at ?? undefined,
    cursor_id: page.next_cursor_id,
  };
}

export default function FollowingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isLoggedIn, isAuthLoading } = useAuth();

  const [following, setFollowing] = useState<Follow[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<MinistersCursor | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) { router.replace("/login"); return; }
    getMyFollowing()
      .then(async (follows) => {
        setFollowing(follows);
        if (follows.length === 0) return;
        const ids = follows.map((f) => f.minister.id);
        const page = await postsApi.getPostsByMinisters(ids);
        setFeed(page.results);
        setNextCursor(nextCursorFrom(page));
      })
      .catch(() => showToast("Failed to load feed.", "error"))
      .finally(() => setLoadingInit(false));
  }, [isLoggedIn, isAuthLoading]);

  function handleDelete(id: number) {
    setFeed((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(updatedPost: Post) {
    setFeed((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const ids = following.map((f) => f.minister.id);
      const page = await postsApi.getPostsByMinisters(ids, nextCursor);
      setFeed((prev) => [...prev, ...page.results]);
      setNextCursor(nextCursorFrom(page));
    } catch {
      showToast("Failed to load more.", "error");
    } finally {
      setLoadingMore(false);
    }
  }

  if (loadingInit) return <Spinner />;

  if (following.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm font-medium text-gray-700">You're not following any ministers yet</p>
        <p className="text-xs text-gray-400 max-w-xs">
          Follow ministers to see posts tagged to them here
        </p>
        <a
          href="/ministers"
          className="mt-1 text-sm text-[#C92A2A] font-medium hover:underline"
        >
          Browse ministers →
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Who you follow */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs text-gray-400 shrink-0">Following</span>
        <div className="flex items-center gap-2">
          {following.map((f) => (
            <a
              key={f.minister.id}
              href="/ministers"
              title={f.minister.name}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <AvatarCircle
                avatar_url={f.minister.avatar_url}
                username={f.minister.name}
                size="sm"
              />
              <span className="text-[10px] text-gray-500 max-w-14 truncate text-center leading-tight">
                {f.minister.name.split(" ").at(-1)}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Posts feed */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Posts</p>
        </div>

        <div className="divide-y divide-gray-100">
          {feed.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">
              No posts tagged to ministers you follow yet.
            </p>
          ) : (
            <>
              {feed.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id ?? -1}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
              {nextCursor && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-3 text-sm text-[#C92A2A] hover:underline disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
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
