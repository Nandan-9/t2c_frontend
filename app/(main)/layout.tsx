"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { House, Users, Building2, FileText } from "lucide-react";
import { UserAuthGuard } from "@/components/UserAuthGuard";
import { NewPostModal } from "@/components/ui/NewPostModal";
import { Toaster } from "@/components/ui/Toast";
import { AvatarCircle } from "@/components/ui/AvatarCircle";
import { tokenStorage } from "@/lib/auth/tokens";
import { userLogout } from "@/lib/auth/api";
import { followMinister, unfollowMinister, getMyFollowing } from "@/lib/api/ministers";
import { ministers as ministersApi } from "@/lib/api/ministers";
import type { Minister, Follow } from "@/lib/api/types";
import type { Post } from "@/lib/api/posts";
import type { RegularUser } from "@/lib/auth/types";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const [lastPost, setLastPost] = useState<Post | null>(null);

  return (
    <UserAuthGuard>
      <div className="font-[family-name:--font-poppins] min-h-screen bg-gray-50 flex">
        <Sidebar onNewPost={() => setShowModal(true)} />
        <main className="flex-1 flex justify-center px-4 py-6">
          <div className="w-full max-w-[600px]">{children}</div>
        </main>
        <RightSidebar lastPost={lastPost} />
        {showModal && (
          <NewPostModal
            onClose={() => setShowModal(false)}
            onPostCreated={(p) => { setLastPost(p); setShowModal(false); }}
          />
        )}
        <Toaster />
      </div>
    </UserAuthGuard>
  );
}

function Sidebar({ onNewPost }: { onNewPost: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = tokenStorage.getUser() as RegularUser | null;

  const navItems = [
    { href: "/home", label: "Home", Icon: House },
    { href: "/following", label: "Following", Icon: Users },
    { href: "/ministers", label: "Ministers", Icon: Building2 },
    { href: "/my-posts", label: "My Posts", Icon: FileText },
  ];

  async function handleLogout() {
    await userLogout();
    router.replace("/login");
  }

  return (
    <aside className="w-[260px] shrink-0 flex flex-col h-screen sticky top-0 border-r border-gray-200 bg-white px-4 py-6 gap-6">
      <div className="flex items-center gap-2.5 px-2">
        <div className="w-9 h-9 rounded-full bg-[#0169CC] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <div>
          <p className="font-bold text-[#0169CC] leading-tight">Talk2CM</p>
          <p className="text-xs text-gray-400">For the people</p>
        </div>
      </div>

      <button
        onClick={onNewPost}
        className="bg-[#0169CC] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#0158b0] transition-colors"
      >
        + New Post
      </button>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border-l-2 ${
                active
                  ? "bg-[#0169CC]/10 text-[#0169CC] border-[#0169CC]"
                  : "text-gray-600 hover:bg-gray-50 border-transparent"
              }`}
            >
              <Icon size={18} />
              {label}
            </a>
          );
        })}
      </nav>

      {user && (
        <div className="flex items-center gap-2 px-2">
          <AvatarCircle avatar_url={"avatar_url" in user ? (user as RegularUser).avatar_url : null} username={user.email.split("@")[0]} size="sm" />
          <p className="text-sm text-gray-700 truncate flex-1">{user.email.split("@")[0]}</p>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Out
          </button>
        </div>
      )}
    </aside>
  );
}

function RightSidebar({ lastPost }: { lastPost: Post | null }) {
  const [following, setFollowing] = useState<Follow[]>([]);
  const [allMinisters, setAllMinisters] = useState<Minister[]>([]);

  useEffect(() => {
    getMyFollowing().then(setFollowing).catch(() => {});
    ministersApi.list().then(setAllMinisters).catch(() => {});
  }, [lastPost]);

  const followingIds = new Set(following.map((f) => f.minister.id));
  const suggested = allMinisters.filter((m) => !followingIds.has(m.id)).slice(0, 3);

  async function handleUnfollow(id: number) {
    await unfollowMinister(id).catch(() => {});
    setFollowing((prev) => prev.filter((f) => f.minister.id !== id));
  }

  async function handleFollow(m: Minister) {
    const follow = await followMinister(m.id).catch(() => null);
    if (follow) setFollowing((prev) => [...prev, follow]);
  }

  return (
    <aside className="w-[300px] shrink-0 h-screen sticky top-0 overflow-y-auto px-4 py-6 flex flex-col gap-6">
      <Widget title="Following">
        {following.length === 0 ? (
          <p className="text-xs text-gray-400">You're not following anyone yet.</p>
        ) : (
          following.slice(0, 5).map((f) => (
            <div key={f.minister.id} className="flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{f.minister.name}</p>
                <p className="text-xs text-gray-400 truncate">{f.minister.tag}</p>
              </div>
              <button
                onClick={() => handleUnfollow(f.minister.id)}
                className="text-xs text-gray-500 border border-gray-300 rounded-full px-2.5 py-1 hover:bg-gray-50 shrink-0"
              >
                Unfollow
              </button>
            </div>
          ))
        )}
      </Widget>

      <Widget title="Suggested Ministers">
        {suggested.length === 0 ? (
          <p className="text-xs text-gray-400">You're following everyone!</p>
        ) : (
          suggested.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                <p className="text-xs text-gray-400 truncate">{m.dept}</p>
              </div>
              <button
                onClick={() => handleFollow(m)}
                className="text-xs text-white bg-[#0169CC] rounded-full px-2.5 py-1 hover:bg-[#0158b0] shrink-0"
              >
                Follow
              </button>
            </div>
          ))
        )}
      </Widget>
    </aside>
  );
}

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {children}
    </div>
  );
}
