"use client";

import { useState } from "react";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { comments as commentsApi, type Comment } from "@/lib/api/comments";
import { useToast } from "@/hooks/useToast";

interface Props {
  comment: Comment;
  postId: number;
  depth: number;
  currentUserId: number;
  onReplyAdded: (parentId: number, reply: Comment) => void;
  onDeleted: (commentId: number) => void;
}

export function CommentThread({
  comment,
  postId,
  depth,
  currentUserId,
  onReplyAdded,
  onDeleted,
}: Props) {
  const { showToast } = useToast();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const newReply = await commentsApi.addComment(postId, replyText.trim(), comment.id);
      onReplyAdded(comment.id, newReply);
      setReplyText("");
      setReplyOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to post reply.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await commentsApi.deleteComment(postId, comment.id);
      onDeleted(comment.id);
    } catch {
      showToast("Failed to delete comment.", "error");
    }
  }

  const indentClass = depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : "";

  return (
    <div className={indentClass}>
      <div className="flex gap-3 py-3">
        <AvatarCircle
          avatar_url={comment.author.avatar_url}
          username={comment.author.username}
          size="sm"
        />
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">{comment.author.username}</span>
              <RelativeTime dateString={comment.created_at} />
            </div>
            <div className="flex items-center gap-3">
              {depth < 3 && (
                <button
                  onClick={() => setReplyOpen((v) => !v)}
                  className="text-xs text-[#4F46E5] hover:text-[#4338CA]"
                >
                  Reply
                </button>
              )}
              {comment.author.id === currentUserId && (
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>

          {replyOpen && (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.author.username}…`}
                rows={2}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setReplyOpen(false); setReplyText(""); }}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || submitting}
                  className="px-4 py-1.5 bg-[#4F46E5] text-white text-xs rounded-full disabled:opacity-50 hover:bg-[#4338CA]"
                >
                  {submitting ? "Posting…" : "Reply"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              currentUserId={currentUserId}
              onReplyAdded={onReplyAdded}
              onDeleted={onDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
