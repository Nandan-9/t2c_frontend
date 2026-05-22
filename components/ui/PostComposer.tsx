"use client";

import { useState, useRef } from "react";
import { posts as postsApi } from "@/lib/api/posts";
import { MinisterSearchDropdown } from "./MinisterSearchDropdown";
import { MinisterBadge } from "./MinisterBadge";
import { useToast } from "@/hooks/useToast";
import type { TagResult } from "@/lib/api/types";
import type { Post } from "@/lib/api/posts";

interface Props {
  onPostCreated: (post: Post) => void;
}

const MAX_CHARS = 500;

export function PostComposer({ onPostCreated }: Props) {
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [minister, setMinister] = useState<TagResult | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const expanded = focused || content.length > 0;
  const remaining = MAX_CHARS - content.length;

  async function handlePost() {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const post = await postsApi.createPost(content.trim(), minister?.id);
      setContent("");
      setMinister(null);
      setFocused(false);
      setShowSearch(false);
      onPostCreated(post);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to post.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
        onFocus={() => setFocused(true)}
        onBlur={() => { if (!content) setFocused(false); }}
        placeholder="What's on your mind?"
        rows={expanded ? 4 : 2}
        className="w-full resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 transition-all"
      />
      {expanded && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {minister ? (
              <div className="flex items-center gap-1">
                <MinisterBadge tag={minister.tag} name={minister.name} />
                <button
                  onClick={() => setMinister(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowSearch((v) => !v)}
                  className="text-xs text-[#0169CC] border border-[#0169CC]/30 rounded-full px-3 py-1 hover:bg-[#0169CC]/5 transition-colors"
                >
                  Tag Minister
                </button>
                {showSearch && (
                  <div className="absolute top-full mt-1 left-0 z-10">
                    <MinisterSearchDropdown
                      onSelect={(m) => { setMinister(m); setShowSearch(false); }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs ${remaining < 50 ? "text-red-500" : "text-gray-400"}`}>
              {remaining}
            </span>
            <button
              onClick={handlePost}
              disabled={!content.trim() || loading || remaining < 0}
              className="px-4 py-1.5 bg-[#0169CC] text-white text-sm rounded-full disabled:opacity-50 hover:bg-[#0158b0] transition-colors"
            >
              {loading ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
