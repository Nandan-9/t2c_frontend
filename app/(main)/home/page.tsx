"use client";

import { useEffect, useState } from "react";
import { posts as postsApi, type Post, type FeedPage, type LatestPage } from "@/lib/api/posts";
import { getMyFollowing } from "@/lib/api/ministers";
import { PostComposer } from "@/components/ui/PostComposer";
import { PostCard } from "@/components/ui/PostCard";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import { MobilePostCard } from "@/components/mobile/MobilePostCard";
import { MobileFeedTabBar } from "@/components/mobile/MobileFeedTabBar";
import { useAuth } from "@/lib/auth/context";

export type Tab = "all" | "trending" | "latest" | "responded";

type UpvoteCursor = { kind: "upvote"; cursor_upvote_count: number; cursor_id: number };
type LatestCursor = { kind: "latest"; cursor_created_at: string; cursor_id: number };
type NextCursor = UpvoteCursor | LatestCursor | null;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "latest", label: "Latest" },
  { id: "responded", label: "Responded" },
];

function upvoteCursorFrom(page: FeedPage): UpvoteCursor | null {
  if (page.next_cursor_id == null) return null;
  return { kind: "upvote", cursor_upvote_count: page.next_cursor_upvote_count ?? 0, cursor_id: page.next_cursor_id };
}

function latestCursorFrom(page: LatestPage): LatestCursor | null {
  if (page.next_cursor_id == null || !page.next_cursor_created_at) return null;
  return { kind: "latest", cursor_created_at: page.next_cursor_created_at, cursor_id: page.next_cursor_id };
}

export default function HomePage() {
  const { user, isLoggedIn, showLoginPrompt } = useAuth();

  const [composerOpen, setComposerOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("trending");
  const [feed, setFeed] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<NextCursor>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  async function loadTab(t: Tab, cursor: NextCursor = null, replace = true) {
    try {
      if (t === "responded") {
        if (replace) { setFeed([]); setNextCursor(null); }
        return;
      }

      if (t === "latest") {
        const c = cursor?.kind === "latest" ? cursor : undefined;
        const page = await postsApi.getLatest(c);
        setIsFallback(false);
        setFeed((prev) => (replace ? page.results : [...prev, ...page.results]));
        setNextCursor(latestCursorFrom(page));
        return;
      }

      // "all" or "trending" — both use upvote cursor
      const c = cursor?.kind === "upvote" ? cursor : undefined;
      let page: FeedPage;

      if (t === "trending") {
        page = await postsApi.getTrending(c);
        setIsFallback(false);
      } else {
        // "all" feed
        page = await postsApi.getFeed(c);

        if (replace && page.results.length === 0 && !c && isLoggedIn) {
          // Fallback: show posts from all ministers
          const following = await getMyFollowing().catch(() => []);
          if (following.length > 0) {
            const ids = following.map((f) => f.minister.id);
            const fallback = await postsApi.getPostsByMinisters(ids).catch(() => ({ results: [] as Post[], next_cursor_upvote_count: null, next_cursor_created_at: null, next_cursor_id: null }));
            setFeed(fallback.results);
            setNextCursor(null);
            setIsFallback(true);
            return;
          }
          setFeed([]);
          setNextCursor(null);
          setIsFallback(false);
          return;
        }

        setIsFallback(false);
      }

      setFeed((prev) => (replace ? page.results : [...prev, ...page.results]));
      setNextCursor(upvoteCursorFrom(page));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setFeed([]);
    setNextCursor(null);
    setIsFallback(false);
    loadTab(tab, null, true);
  }, [tab]);

  function handlePostCreated(post: Post) {
    setComposerOpen(false);
    if (tab === "all" || tab === "latest") {
      setFeed((prev) => [post, ...prev]);
    }
  }

  function handleDelete(id: number) {
    setFeed((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(updatedPost: Post) {
    setFeed((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await loadTab(tab, nextCursor, false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-col gap-4">
        {/* Mini composer bar */}
        {isLoggedIn && (!composerOpen ? (
          <div
            className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 cursor-pointer"
            onClick={() => setComposerOpen(true)}
          >
            <AvatarCircle
              avatar_url={user?.avatar_url ?? null}
              username={user?.username ?? "?"}
              size="sm"
            />
            <span className="flex-1 text-sm text-gray-400 select-none">
              What issue matters to you today?
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setComposerOpen(true); }}
              className="bg-[#C92A2A] hover:bg-[#a82323] text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Post
            </button>
          </div>
        ) : (
          <PostComposer onPostCreated={handlePostCreated} />
        ))}

        {/* Tab navigation + feed */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex gap-1 border-b border-gray-100 px-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-3 px-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  tab === t.id ? "text-[#C92A2A]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C92A2A] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-100">
            {tab === "responded" ? (
              <RespondedEmpty />
            ) : loading ? (
              <Spinner />
            ) : feed.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-12">No posts yet.</p>
            ) : (
              <>
                {isFallback && <FallbackBanner />}
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

      {/* ── Mobile layout ── */}
      <div className="md:hidden -mx-4">
        <MobileFeedTabBar tab={tab} onTabChange={setTab} />

        <div className="divide-y divide-gray-100">
          {tab === "responded" ? (
            <RespondedEmpty />
          ) : loading ? (
            <div className="py-12"><Spinner /></div>
          ) : feed.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No posts yet.</p>
          ) : (
            <>
              {isFallback && <FallbackBanner />}
              {feed.map((post) => (
                <MobilePostCard
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

function RespondedEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm text-gray-400 max-w-xs">
        If a govt official replies to your post it will appear here
      </p>
    </div>
  );
}

function FallbackBanner() {
  return (
    <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50">
      You&apos;re not following anyone yet — showing all posts.
    </div>
  );
}
