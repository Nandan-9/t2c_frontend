"use client";

import { useEffect, useState } from "react";
import { posts as postsApi, type Post } from "@/lib/api/posts";
import { ministers as ministersApi } from "@/lib/api/ministers";
import { PostComposer } from "@/components/ui/PostComposer";
import { PostCard } from "@/components/ui/PostCard";
import { tokenStorage } from "@/lib/auth/tokens";
import type { RegularUser } from "@/lib/auth/types";

export default function HomePage() {
  const [feed, setFeed] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const user = tokenStorage.getUser() as RegularUser | null;

  async function loadFeed(p: number, replace = false) {
    try {
      const data = await postsApi.getFeed(p);

      if (replace && data.results.length === 0) {
        // No followed posts — fall back to all ministers' posts
        const allMinisters = await ministersApi.list();
        const allPostArrays = await Promise.all(
          allMinisters.map((m) => postsApi.getPostsByMinister(m.id).catch(() => [] as Post[]))
        );
        const allPosts = allPostArrays
          .flat()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setFeed(allPosts);
        setHasMore(false);
        setIsFallback(true);
        return;
      }

      setFeed((prev) => (replace ? data.results : [...prev, ...data.results]));
      setHasMore(data.next !== null);
      setIsFallback(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => { loadFeed(1, true); }, []);

  function handlePostCreated(post: Post) {
    setFeed((prev) => [post, ...prev]);
  }

  function handleDelete(id: number) {
    setFeed((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(id: number, content: string) {
    setFeed((prev) => prev.map((p) => (p.id === id ? { ...p, content } : p)));
  }

  async function loadMore() {
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    await loadFeed(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <PostComposer onPostCreated={handlePostCreated} />

      {isFallback && (
        <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          You're not following anyone yet — showing all posts. Follow ministers to personalise your feed.
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : feed.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">No posts yet. Be the first!</p>
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
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="py-3 text-sm text-[#0169CC] hover:underline disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
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
