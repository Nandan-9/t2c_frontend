"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { posts as postsApi } from "@/lib/api/posts";
import { AvatarCircle } from "./AvatarCircle";
import { RelativeTime } from "./RelativeTime";
import { MinisterBadge } from "./MinisterBadge";
import { VoteButtons } from "./VoteButtons";
import { useToast } from "@/hooks/useToast";
import type { Post } from "@/lib/api/posts";

interface Props {
  post: Post;
  currentUserId: number;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, newContent: string) => void;
}

export function PostCard({ post, currentUserId, onDelete, onEdit }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isAuthor = post.author.id === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSave() {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await postsApi.editPost(post.id, editContent.trim());
      onEdit?.(post.id, editContent.trim());
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <AvatarCircle avatar_url={post.author.avatar_url} username={post.author.username} />
          <div>
            <p className="text-sm font-medium text-gray-800">{post.author.username}</p>
            <RelativeTime dateString={post.created_at} />
          </div>
        </div>
        {isAuthor && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => { setEditing(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#0169CC]/30 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setEditing(false); setEditContent(post.content); }}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-sm text-white bg-[#0169CC] rounded-full disabled:opacity-50 hover:bg-[#0158b0]"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
      )}

      {post.minister && (
        <MinisterBadge tag={post.minister.tag} name={post.minister.name} />
      )}

      <div className="flex items-center gap-4 pt-1">
        <VoteButtons
          postId={post.id}
          upvote_count={post.upvote_count}
          downvote_count={post.downvote_count}
          user_vote={post.user_vote}
        />
        <button
          onClick={() => router.push(`/posts/${post.id}`)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {post.comment_count}
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-5">
            <p className="text-sm text-gray-700">Are you sure you want to delete this post?</p>
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
