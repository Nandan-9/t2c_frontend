"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { posts as postsApi } from "@/lib/api/posts";
import { AvatarCircle } from "./AvatarCircle";
import { RelativeTime } from "./RelativeTime";
import { DepartmentBadge } from "./DepartmentBadge";
import { MinisterBadge } from "./MinisterBadge";
import { VoteButtons } from "./VoteButtons";
import { useToast } from "@/hooks/useToast";
import { ReportModal } from "./ReportModal";
import { MediaViewerModal } from "./MediaViewerModal";
import { MinisterSearchDropdown } from "./MinisterSearchDropdown";
import { listDepartments } from "@/lib/api/departments";
import type { Post } from "@/lib/api/posts";
import type { TagResult } from "@/lib/api/types";
import type { Department } from "@/lib/api/departments";

interface Props {
  post: Post;
  currentUserId: number;
  onDelete?: (id: number) => void;
  onEdit?: (updatedPost: Post) => void;
  detailView?: boolean;
}

export function PostCard({ post, currentUserId, onDelete, onEdit, detailView }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isAuthor = post.author.id === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editHeading, setEditHeading] = useState(post.heading);
  const [editContent, setEditContent] = useState(post.content);
  const [editMinisters, setEditMinisters] = useState<TagResult[]>(
    post.ministers.map((m) => ({ id: m.id, name: m.name, tag: m.tag })),
  );
  const [editDepartments, setEditDepartments] = useState<{ id: number; name: string }[]>(post.departments);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [deptOpen, setDeptOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [mediaViewer, setMediaViewer] = useState(false);
  const [imgPortrait, setImgPortrait] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) setDeptOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openEdit() {
    setEditHeading(post.heading);
    setEditContent(post.content);
    setEditMinisters(post.ministers.map((m) => ({ id: m.id, name: m.name, tag: m.tag })));
    setEditDepartments(post.departments);
    setEditing(true);
    setMenuOpen(false);
    listDepartments().then(setAllDepartments).catch(() => {});
  }

  function cancelEdit() {
    setEditing(false);
    setEditHeading(post.heading);
    setEditContent(post.content);
    setEditMinisters(post.ministers.map((m) => ({ id: m.id, name: m.name, tag: m.tag })));
    setEditDepartments(post.departments);
    setDeptOpen(false);
  }

  function addMinister(m: TagResult) {
    if (!editMinisters.some((x) => x.id === m.id)) {
      setEditMinisters((prev) => [...prev, m]);
    }
  }

  function removeMinister(id: number) {
    setEditMinisters((prev) => prev.filter((m) => m.id !== id));
  }

  function addDepartment(dept: { id: number; name: string }) {
    if (!editDepartments.some((d) => d.id === dept.id)) {
      setEditDepartments((prev) => [...prev, dept]);
    }
    setDeptOpen(false);
  }

  function removeDepartment(id: number) {
    setEditDepartments((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleSave() {
    if (!editHeading.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      const updated = await postsApi.editPost(post.id, {
        heading: editHeading.trim(),
        content: editContent.trim(),
        minister_ids: editMinisters.map((m) => m.id),
        department_ids: editDepartments.map((d) => d.id),
      });
      onEdit?.(updated);
      setEditing(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await postsApi.deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete.", "error");
    }
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied", "success");
    } catch {
      showToast("Could not copy link", "error");
    }
  }

  const availableDepartments = allDepartments.filter((d) => !editDepartments.some((ed) => ed.id === d.id));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Clickable body */}
      <div
        className={`p-5 pb-4 ${!editing && !detailView ? "cursor-pointer" : ""}`}
        onClick={() => { if (!editing && !detailView) router.push(`/posts/${post.id}`); }}
      >
        {/* Author header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <AvatarCircle avatar_url={post.author.avatar_url} username={post.author.username} size="lg" />
            <div>
              <p className="text-base font-semibold text-gray-900 leading-tight">{post.author.username}</p>
              <p className="text-sm text-gray-400 leading-tight">
                @{post.author.username}&nbsp;·&nbsp;<RelativeTime dateString={post.created_at} />
              </p>
            </div>
          </div>
          <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-lg leading-none"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {isAuthor ? (
                  <>
                    {post.can_edit && (
                      <button
                        onClick={openEdit}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setReportOpen(true); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {editing ? (
          <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <input
              value={editHeading}
              onChange={(e) => setEditHeading(e.target.value)}
              placeholder="Heading"
              className="w-full border border-gray-200 rounded-lg p-2.5 text-base font-medium outline-none focus:ring-2 focus:ring-[#C92A2A]/30"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-base outline-none focus:ring-2 focus:ring-[#C92A2A]/30 resize-none"
            />

            {/* Tag editing */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</p>

              {/* Current tags */}
              {(editMinisters.length > 0 || editDepartments.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {editDepartments.map((dept) => (
                    <span
                      key={dept.id}
                      className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1"
                    >
                      {dept.name}
                      <button
                        onClick={() => removeDepartment(dept.id)}
                        className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {editMinisters.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 text-xs bg-red-50 text-[#C92A2A] border border-red-200 rounded-full px-2.5 py-1"
                    >
                      {m.tag}
                      <button
                        onClick={() => removeMinister(m.id)}
                        className="ml-0.5 text-red-300 hover:text-[#C92A2A] leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add tags */}
              <div className="flex flex-wrap gap-2 items-start">
                {/* Department dropdown */}
                <div ref={deptRef} className="relative">
                  <button
                    onClick={() => setDeptOpen((v) => !v)}
                    className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                  >
                    + Department
                  </button>
                  {deptOpen && (
                    <ul className="absolute top-full mt-1 left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-y-auto max-h-48">
                      {availableDepartments.length === 0 ? (
                        <li className="px-4 py-2.5 text-sm text-gray-400">No more departments</li>
                      ) : (
                        availableDepartments.map((d) => (
                          <li key={d.id}>
                            <button
                              onClick={() => addDepartment({ id: d.id, name: d.name })}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {d.name}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                {/* Minister search */}
                <MinisterSearchDropdown onSelect={addMinister} />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-[#C92A2A] rounded disabled:opacity-50 hover:bg-[#a82323]"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1.5 leading-snug">{post.heading}</h2>
            <p className="text-base text-gray-700 whitespace-pre-wrap wrap-break-word mb-4">{post.content}</p>

            {post.media_url && post.media_type === "image" && (
              <div
                className={`${imgPortrait ? "aspect-9/16 max-w-75 mx-auto" : "aspect-video"} rounded-xl overflow-hidden border border-gray-100 mb-4 bg-gray-50 flex items-center justify-center ${detailView ? "cursor-zoom-in" : ""}`}
                onClick={detailView ? (e) => { e.stopPropagation(); setMediaViewer(true); } : undefined}
              >
                <img
                  src={post.media_url}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                  onLoad={(e) => {
                    const { naturalWidth, naturalHeight } = e.currentTarget;
                    setImgPortrait(naturalWidth < naturalHeight);
                  }}
                />
              </div>
            )}
            {post.media_url && post.media_type === "video" && (
              detailView ? (
                <div
                  className="rounded-xl overflow-hidden border border-gray-100 mb-4 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setMediaViewer(true); }}
                >
                  <video src={post.media_url} className="w-full h-auto pointer-events-none" />
                </div>
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-100 mb-4">
                  <video src={post.media_url} controls className="w-full h-full object-cover" />
                </div>
              )
            )}

            {((post.departments?.length ?? 0) > 0 || (post.ministers?.length ?? 0) > 0 || post.district) && (
              <div className="flex items-center gap-2 flex-wrap">
                {post.departments.map((dept) => (
                  <DepartmentBadge key={dept.id} name={dept.name} />
                ))}
                {post.ministers.map((min) => (
                  <MinisterBadge key={min.id} tag={min.tag} name={min.name} />
                ))}
                {post.district && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {post.district.name}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <VoteButtons
            postId={post.id}
            upvote_count={post.upvote_count}
            downvote_count={post.downvote_count}
            user_vote={post.user_vote}
          />
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/posts/${post.id}`); }}
            className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {post.comment_count ?? 0}
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      {reportOpen && (
        <ReportModal postId={post.id} onClose={() => setReportOpen(false)} />
      )}

      {mediaViewer && post.media_url && post.media_type && (
        <MediaViewerModal
          src={post.media_url}
          type={post.media_type}
          onClose={() => setMediaViewer(false)}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-5">
            <p className="text-base text-gray-700">Are you sure you want to delete this post?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmDelete(false); handleDelete(); }}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
