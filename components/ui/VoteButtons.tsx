"use client";

import { useState } from "react";
import { posts as postsApi } from "@/lib/api/posts";

interface Props {
  postId: number;
  upvote_count: number;
  downvote_count: number;
  user_vote: "upvote" | "downvote" | null;
  onVoteChange?: (upvotes: number, downvotes: number, userVote: "upvote" | "downvote" | null) => void;
}

export function VoteButtons({ postId, upvote_count, downvote_count, user_vote, onVoteChange }: Props) {
  const [upvotes, setUpvotes] = useState(upvote_count);
  const [downvotes, setDownvotes] = useState(downvote_count);
  const [userVote, setUserVote] = useState(user_vote);
  const [loading, setLoading] = useState(false);

  async function handleVote(type: "upvote" | "downvote") {
    if (loading) return;
    setLoading(true);

    let newUp = upvotes;
    let newDown = downvotes;
    let newVote: "upvote" | "downvote" | null;

    if (userVote === type) {
      newUp = type === "upvote" ? upvotes - 1 : upvotes;
      newDown = type === "downvote" ? downvotes - 1 : downvotes;
      newVote = null;
    } else if (userVote !== null) {
      newUp = type === "upvote" ? upvotes + 1 : upvotes - 1;
      newDown = type === "downvote" ? downvotes + 1 : downvotes - 1;
      newVote = type;
    } else {
      newUp = type === "upvote" ? upvotes + 1 : upvotes;
      newDown = type === "downvote" ? downvotes + 1 : downvotes;
      newVote = type;
    }

    setUpvotes(newUp);
    setDownvotes(newDown);
    setUserVote(newVote);
    onVoteChange?.(newUp, newDown, newVote);

    try {
      if (userVote === type) {
        await postsApi.removeVote(postId, type);
      } else {
        await postsApi.castVote(postId, type);
      }
    } catch {
      setUpvotes(upvotes);
      setDownvotes(downvotes);
      setUserVote(userVote);
      onVoteChange?.(upvotes, downvotes, userVote);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote("upvote")}
        className={`flex items-center gap-1 text-sm transition-colors ${
          userVote === "upvote" ? "text-[#0169CC]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={userVote === "upvote" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={userVote === "upvote" ? "text-[#0169CC] font-medium" : ""}>{upvotes}</span>
      </button>

      <button
        onClick={() => handleVote("downvote")}
        className={`flex items-center gap-1 text-sm transition-colors ${
          userVote === "downvote" ? "text-[#0169CC]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={userVote === "downvote" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={userVote === "downvote" ? "text-[#0169CC] font-medium" : ""}>{downvotes}</span>
      </button>
    </div>
  );
}
