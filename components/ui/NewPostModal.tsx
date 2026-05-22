"use client";

import { useEffect } from "react";
import { PostComposer } from "./PostComposer";
import type { Post } from "@/lib/api/posts";

interface Props {
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export function NewPostModal({ onClose, onPostCreated }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg mx-4">
        <PostComposer onPostCreated={(post) => { onPostCreated(post); onClose(); }} />
      </div>
    </div>
  );
}
