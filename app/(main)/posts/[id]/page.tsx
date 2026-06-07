"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { posts as postsApi, type Post } from "@/lib/api/posts";
import { comments as commentsApi, type Comment } from "@/lib/api/comments";
import { PostCard } from "@/components/ui/PostCard";
import { CommentThread } from "@/components/ui/CommentThread";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/lib/auth/context";

function insertReply(list: Comment[], parentId: number, reply: Comment): Comment[] {
  return list.map((c) => {
    if (c.id === parentId) return { ...c, replies: [...c.replies, reply] };
    if (c.replies.length > 0) return { ...c, replies: insertReply(c.replies, parentId, reply) };
    return c;
  });
}

function removeComment(list: Comment[], id: number): Comment[] {
  return list
    .filter((c) => c.id !== id)
    .map((c) => ({ ...c, replies: removeComment(c.replies, id) }));
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isLoggedIn, showLoginPrompt } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentFocused, setCommentFocused] = useState(false);

  useEffect(() => {
    const postId = Number(id);
    Promise.all([postsApi.getPost(postId), commentsApi.getComments(postId)])
      .then(([detail, threadedComments]) => {
        setPost(detail);
        setCommentList(threadedComments);
      })
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
      setCommentFocused(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to comment.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReplyAdded(parentId: number, reply: Comment) {
    setCommentList((prev) => insertReply(prev, parentId, reply));
  }

  function handleDeleted(commentId: number) {
    setCommentList((prev) => removeComment(prev, commentId));
  }

  if (loading) return <Spinner />;
  if (!post) return <p className="text-center text-gray-400 text-sm py-12">Post not found.</p>;

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#C92A2A] self-start -mb-1"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <PostCard
        post={post}
        currentUserId={user?.id ?? -1}
        onEdit={(updatedPost) => setPost(updatedPost)}
        detailView
      />

      <div className="border-t border-gray-200 pt-4 flex flex-col gap-2">
        {isLoggedIn ? (
          <>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => setCommentFocused(true)}
              onBlur={() => { if (!commentText.trim()) setCommentFocused(false); }}
              placeholder="Write a comment…"
              rows={commentFocused ? 3 : 1}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#C92A2A]/30 resize-none transition-all"
            />
            {commentFocused && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setCommentText(""); setCommentFocused(false); }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || submitting}
                  className="px-4 py-2 bg-[#C92A2A] text-white text-sm rounded-lg disabled:opacity-50 hover:bg-[#a82323]"
                >
                  {submitting ? "Posting…" : "Comment"}
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={showLoginPrompt}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-400 text-left hover:border-[#C92A2A] hover:text-[#C92A2A] transition-colors"
          >
            Login to comment…
          </button>
        )}
      </div>

      <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 px-4">
        {commentList.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">No comments yet.</p>
        )}
        {commentList.map((c) => (
          <CommentThread
            key={c.id}
            comment={c}
            postId={Number(id)}
            depth={0}
            currentUserId={user?.id ?? -1}
            onReplyAdded={handleReplyAdded}
            onDeleted={handleDeleted}
          />
        ))}
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
