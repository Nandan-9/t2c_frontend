"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { posts as postsApi, type Post } from "@/lib/api/posts";
import { PostCard } from "@/components/ui/PostCard";
import { useAuth } from "@/lib/auth/context";

export default function MyPostsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isAuthLoading } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) { router.replace("/login"); return; }
    if (!user) return;
    postsApi
      .getFeed()
      .then((data) => setMyPosts(data.results.filter((p) => p.author.id === user.id)))
      .finally(() => setLoading(false));
  }, [isLoggedIn, isAuthLoading]);

  function handleDelete(id: number) {
    setMyPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(updatedPost: Post) {
    setMyPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
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
      <div className="w-6 h-6 border-2 border-[#C92A2A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
