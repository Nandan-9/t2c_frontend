"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { posts as postsApi } from "@/lib/api/posts";
import { AvatarCircle } from "./AvatarCircle";
import { RelativeTime } from "./RelativeTime";
import { DepartmentBadge } from "./DepartmentBadge";
import { MinisterBadge } from "./MinisterBadge";
import { VoteButtons } from "./VoteButtons";
import { useToast } from "@/hooks/useToast";
import { ReportModal } from "./ReportModal";
import type { Post } from "@/lib/api/posts";

interface Props {
  post: Post;
  currentUserId: number;
  onDelete?: (id: number) => void;
  onEdit?: (updatedPost: Post) => void;
  detailView?: boolean;
}

export function PostCard({ post, currentUserId, onDelete, onEdit, detailView }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isAuthor = post.author.id === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editHeading, setEditHeading] = useState(post.heading);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);


  console.log(post)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSave() {
    if (!editHeading.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      const updated = await postsApi.editPost(post.id, {
        heading: editHeading.trim(),
        content: editContent.trim(),
      });
      onEdit?.(updated);
      setEditing(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Clickable body */}
      <div
        className={`p-5 pb-4 ${!editing ? "cursor-pointer" : ""}`}
        onClick={() => { if (!editing) router.push(`/posts/${post.id}`); }}
      >
        {/* Author header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <AvatarCircle avatar_url={post.author.avatar_url} username={post.author.username} size="lg" />
            <div>
              <p className="text-base font-semibold text-gray-900 leading-tight">{post.author.username}</p>
              <p className="text-sm text-gray-400 leading-tight">
                @{post.author.username}&nbsp;·&nbsp;<RelativeTime dateString={post.created_at} />
              </p>
            </div>
          </div>
          <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-lg leading-none"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {isAuthor ? (
                  <>
                    {post.can_edit && (
                      <button
                        onClick={() => { setEditing(true); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </>
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

        {/* Content */}
        {editing ? (
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              value={editHeading}
              onChange={(e) => setEditHeading(e.target.value)}
              placeholder="Heading"
              className="w-full border border-gray-200 rounded-lg p-2.5 text-base font-medium outline-none focus:ring-2 focus:ring-[#C92A2A]/30"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-base outline-none focus:ring-2 focus:ring-[#C92A2A]/30 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditing(false); setEditHeading(post.heading); setEditContent(post.content); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-[#C92A2A] rounded disabled:opacity-50 hover:bg-[#a82323]"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1.5 leading-snug">{post.heading}</h2>
            <p className="text-base text-gray-700 line-clamp-3 whitespace-pre-wrap mb-4">{post.content}</p>

            {post.media_url && post.media_type === "image" && (
              detailView ? (
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-100 mb-4 bg-gray-50 flex items-center justify-center">
                  <img src={post.media_url} alt="" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-100 mb-4 bg-gray-50 flex items-center justify-center">
                  <img src={post.media_url} alt="" className="max-w-full max-h-full object-contain" />
                </div>
              )
            )}
            {post.media_url && post.media_type === "video" && (
              detailView ? (
                <div className="rounded-xl overflow-hidden border border-gray-100 mb-4">
                  <video src={post.media_url} controls className="w-full h-auto" />
                </div>
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-100 mb-4">
                  <video src={post.media_url} controls className="w-full h-full object-cover" />
                </div>
              )
            )}

            {(post.department || post.minister || post.district) && (
              <div className="flex items-center gap-2 flex-wrap">
                {post.department && <DepartmentBadge name={post.department.name} />}
                {post.minister && <MinisterBadge tag={post.minister.tag} name={post.minister.name} />}
                {post.district && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {post.district.name}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <VoteButtons
            postId={post.id}
            upvote_count={post.upvote_count}
            downvote_count={post.downvote_count}
            user_vote={post.user_vote}
          />
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/posts/${post.id}`); }}
            className="flex items-center gap-2 text-base text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {post.comment_count ?? 0}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setBookmarked((v) => !v); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Bookmark"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={bookmarked ? "#C92A2A" : "none"}
              stroke={bookmarked ? "#C92A2A" : "currentColor"}
              strokeWidth="2"
              className={bookmarked ? "" : "text-gray-400 hover:text-gray-600"}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {reportOpen && (
        <ReportModal postId={post.id} onClose={() => setReportOpen(false)} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-5">
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
    </div>
  );
}
