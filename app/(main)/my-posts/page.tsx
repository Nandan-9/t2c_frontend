"use client";

import { useEffect, useState } from "react";
import { posts as postsApi, type Post } from "@/lib/api/posts";
import { PostCard } from "@/components/ui/PostCard";
import { tokenStorage } from "@/lib/auth/tokens";
import type { RegularUser } from "@/lib/auth/types";

export default function MyPostsPage() {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const user = tokenStorage.getUser() as RegularUser | null;

  useEffect(() => {
    if (!user) return;
    postsApi
      .getFeed(1)
      .then((data) => setMyPosts(data.results.filter((p) => p.author.id === user.id)))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: number) {
    setMyPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(id: number, content: string) {
    setMyPosts((prev) => prev.map((p) => p.id === id ? { ...p, content } : p));
  }

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-gray-800">My Posts</h1>
      {myPosts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">You haven't posted yet.</p>
      ) : (
        myPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={user?.id ?? -1}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))
      )}
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
