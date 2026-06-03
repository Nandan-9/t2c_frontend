"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { posts as postsApi } from "@/lib/api/posts";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { VoteButtons } from "@/components/ui/VoteButtons";
import { ReportModal } from "@/components/ui/ReportModal";
import { useToast } from "@/hooks/useToast";
import type { Post } from "@/lib/api/posts";

interface MobilePostCardProps {
  post: Post;
  currentUserId: number;
  onDelete?: (id: number) => void;
  onEdit?: (updatedPost: Post) => void;
}

export function MobilePostCard({ post, currentUserId, onDelete, onEdit }: MobilePostCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isAuthor = post.author.id === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasBadges =
    (post.departments?.length ?? 0) > 0 ||
    (post.ministers?.length ?? 0) > 0 ||
    !!post.district;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleDelete() {
    try {
      await postsApi.deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete.", "error");
    }
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied", "success");
    } catch {
      showToast("Could not copy link", "error");
    }
  }

  function navigateToPost() {
    router.push(`/posts/${post.id}`);
  }

  return (
    <article className="bg-white border-b border-gray-100">
      {/* Author row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <AvatarCircle
          avatar_url={post.author.avatar_url}
          username={post.author.username}
          size="md"
        />
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {post.author.username}
          </p>
          <p className="text-xs text-gray-400 leading-tight">
            @{post.author.username}&nbsp;·&nbsp;
            <RelativeTime dateString={post.created_at} />
          </p>
        </div>

        {/* Kebab menu */}
        <div
          ref={menuRef}
          className="ml-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-lg leading-none"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {isAuthor ? (
                <button
                  onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={() => { setReportOpen(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clickable content area */}
      <div className="px-4 pb-2 cursor-pointer" onClick={navigateToPost}>
        <h2 className="text-base font-bold text-gray-900 line-clamp-2 mb-1 leading-snug">
          {post.heading}
        </h2>
        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Full-width media */}
      {post.media_url && post.media_type === "image" && (
        <div
          className="w-full aspect-video bg-gray-50 cursor-pointer overflow-hidden"
          onClick={navigateToPost}
        >
          <img
            src={post.media_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {post.media_url && post.media_type === "video" && (
        <div className="w-full aspect-video bg-gray-50 overflow-hidden">
          <video
            src={post.media_url}
            controls
            className="w-full h-full object-cover"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Horizontally scrollable badge row */}
      {hasBadges && (
        <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden px-4 py-2">
          {post.departments.map((dept) => (
            <span
              key={dept.id}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 shrink-0 whitespace-nowrap max-w-30 truncate"
            >
              {dept.name}
            </span>
          ))}
          {post.ministers.map((min) => (
            <span
              key={min.id}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#C92A2A]/10 text-[#C92A2A] shrink-0 whitespace-nowrap"
            >
              {min.tag}
            </span>
          ))}
          {post.district && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1 shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {post.district.name}
            </span>
          )}
        </div>
      )}

      {/* Action bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50"
        onClick={(e) => e.stopPropagation()}
      >
        <VoteButtons
          postId={post.id}
          upvote_count={post.upvote_count}
          downvote_count={post.downvote_count}
          user_vote={post.user_vote}
        />
        <button
          onClick={navigateToPost}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {post.comment_count ?? 0}
        </button>
        <button
          onClick={handleShare}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Share"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      {reportOpen && (
        <ReportModal postId={post.id} onClose={() => setReportOpen(false)} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5">
            <p className="text-base text-gray-700">Are you sure you want to delete this post?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmDelete(false); handleDelete(); }}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
