"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { posts as postsApi, type Post } from "@/lib/api/posts";
import { comments as commentsApi, type Comment } from "@/lib/api/comments";
import { PostCard } from "@/components/ui/PostCard";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { tokenStorage } from "@/lib/auth/tokens";
import { useToast } from "@/hooks/useToast";
import type { RegularUser } from "@/lib/auth/types";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = tokenStorage.getUser() as RegularUser | null;

  useEffect(() => {
    Promise.all([
      postsApi.getPost(Number(id)),
      commentsApi.getComments(Number(id)),
    ])
      .then(([p, c]) => { setPost(p); setCommentList(c); })
      .catch(() => showToast("Failed to load post.", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleComment() {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const c = await commentsApi.addComment(Number(id), commentText.trim());
      setCommentList((prev) => [...prev, c]);
      setCommentText("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to comment.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    await commentsApi.deleteComment(Number(id), commentId).catch(() => {});
    setCommentList((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) return <Spinner />;
  if (!post) return <p className="text-center text-gray-400 text-sm py-12">Post not found.</p>;

  return (
    <div className="flex flex-col gap-4">
      <PostCard
        post={post}
        currentUserId={user?.id ?? -1}
        onEdit={(_, content) => setPost((p) => p ? { ...p, content } : p)}
      />

      <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#0169CC]/30 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleComment}
            disabled={!commentText.trim() || submitting}
            className="px-4 py-2 bg-[#0169CC] text-white text-sm rounded-full disabled:opacity-50 hover:bg-[#0158b0]"
          >
            {submitting ? "Posting…" : "Comment"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {commentList.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
            <AvatarCircle avatar_url={c.author.avatar_url} username={c.author.username} size="sm" />
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{c.author.username}</span>
                  <RelativeTime dateString={c.created_at} />
                </div>
                {c.author.id === (user?.id ?? -1) && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
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
