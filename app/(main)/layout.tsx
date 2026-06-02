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
import { getTopDepartments, type TopDepartment } from "@/lib/api/departments";
import { posts as postsApi } from "@/lib/api/posts";
import type { Minister, Follow } from "@/lib/api/types";
import type { Post } from "@/lib/api/posts";
import type { RegularUser } from "@/lib/auth/types";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [lastPost, setLastPost] = useState<Post | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [user, setUser] = useState<RegularUser | null>(null);

  useEffect(() => {
    const u = tokenStorage.getUser() as RegularUser | null;
    setUser(u);
    if (!u) return;
    const key = `welcome_seen_${u.username}`;
    if (!localStorage.getItem(key)) {
      setShowWelcome(true);
    }
  }, []);

  
  function dismissWelcome() {
    if (user) localStorage.setItem(`welcome_seen_${user.username}`, "1");
    setShowWelcome(false);
  }

  return (
    <UserAuthGuard>
      <div className="font-[family-name:--font-poppins] min-h-screen bg-[#f5f5f0] flex">
        <Sidebar onNewPost={() => setShowModal(true)} />
        <main className="flex-1 flex justify-center px-4 py-6">
          <div className={`w-full ${pathname === "/ministers" ? "max-w-[1080px]" : "max-w-[980px]"}`}>{children}</div>
        </main>
        <RightSidebar lastPost={lastPost} />
        {showModal && (
          <NewPostModal
            onClose={() => setShowModal(false)}
            onPostCreated={(p) => { setLastPost(p); setShowModal(false); }}
          />
        )}
        {showWelcome && user && <WelcomeModal username={user.username} onDismiss={dismissWelcome} />}
        <Toaster />
      </div>
    </UserAuthGuard>
  );
}

function WelcomeModal({ username, onDismiss }: { username: string; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-gray-900">Welcome, {username} 👋</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            You&apos;re one of the selected users with early access to our app.
          </p>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          This version is still being tested, so you may encounter occasional bugs or unfinished features. Your feedback helps us improve the experience before launch.
        </p>
        <button
          onClick={onDismiss}
          className="w-full bg-[#C92A2A] text-white rounded py-2.5 text-sm font-medium hover:bg-[#a82323] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
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
    <aside className="w-80 shrink-0 flex flex-col h-screen sticky top-0 border-r border-gray-200 bg-white px-4 py-6 gap-6">
      <div className="flex items-center gap-2.5 px-2">
        <div className="w-9 h-9 rounded-full bg-[#C92A2A] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <div>
          <p className="font-bold text-[#C92A2A] leading-tight">Keralam speaks</p>
          <p className="text-xs text-gray-400">For the people</p>
        </div>
      </div>

      <button
        onClick={onNewPost}
        className="bg-[#C92A2A] text-white rounded px-5 py-2 text-sm font-medium hover:bg-[#a82323] transition-colors"
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors border-l-2 ${
                active
                  ? "bg-[#C92A2A]/10 text-[#C92A2A] border-[#C92A2A]"
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
          <AvatarCircle avatar_url={"avatar_url" in user ? (user as RegularUser).avatar_url : null} username={user.username} size="sm" />
          <p className="text-sm text-gray-700 truncate flex-1">{user.username}</p>
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
  const [topDepts, setTopDepts] = useState<TopDepartment[]>([]);
  const [trending, setTrending] = useState<Post[]>([]);

  useEffect(() => {
    getMyFollowing().then(setFollowing).catch(() => {});
    ministersApi.list().then(setAllMinisters).catch(() => {});
  }, [lastPost]);

  useEffect(() => {
    getTopDepartments().then(setTopDepts).catch(() => {});
    postsApi.getTrending().then((p) => setTrending(p.results.slice(0, 10))).catch(() => {});
  }, []);

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
    <aside className="w-104 shrink-0 h-screen sticky top-0 overflow-y-auto px-4 py-6 flex flex-col gap-6">
      {trending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Now trending in Kerala</p>
          </div>
          <div className="divide-y divide-gray-100">
            {trending.map((post, i) => (
              <a
                key={post.id}
                href={`/posts/${post.id}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xs font-bold text-gray-300 mt-0.5 w-4 shrink-0">{i + 1}</span>
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-[#C92A2A] transition-colors">
                    {post.heading}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {post.upvote_count}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {post.comment_count ?? 0}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {topDepts.length > 0 && (
        <Widget title="Most Tagged Depts">
          {topDepts.slice(0, 6).map((d) => {
            const max = topDepts[0]?.post_count || 1;
            const pct = max > 0 ? Math.round((d.post_count / max) * 100) : 0;
            return (
              <div key={d.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 truncate">{d.name}</span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{d.post_count}</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C92A2A] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Widget>
      )}

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
                className="text-xs text-gray-500 border border-gray-300 rounded px-2.5 py-1 hover:bg-gray-50 shrink-0"
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
                className="text-xs text-white bg-[#C92A2A] rounded px-2.5 py-1 hover:bg-[#a82323] shrink-0"
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
