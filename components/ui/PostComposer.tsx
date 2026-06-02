"use client";

import { useState, useRef, useEffect } from "react";
import { posts as postsApi } from "@/lib/api/posts";
import { listDepartments } from "@/lib/api/departments";
import { listDistricts } from "@/lib/api/districts";
import { DepartmentBadge } from "./DepartmentBadge";
import { MinisterBadge } from "./MinisterBadge";
import { MentionDropdown } from "./MentionDropdown";
import { useToast } from "@/hooks/useToast";
import type { Department } from "@/lib/api/departments";
import type { District, TagResult } from "@/lib/api/types";
import type { Post } from "@/lib/api/posts";

interface Props {
  onPostCreated: (post: Post) => void;
}

const MAX_CHARS = 500;

export function PostComposer({ onPostCreated }: Props) {
  const { showToast } = useToast();
  const [heading, setHeading] = useState("");
  const [content, setContent] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<{ id: number; name: string }[]>([]);
  const [selectedMinisters, setSelectedMinisters] = useState<TagResult[]>([]);
  const [district, setDistrict] = useState<District | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtQuery, setDistrictQuery] = useState("");
  const [districtOpen, setDistrictOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const expanded = focused || content.length > 0 || heading.length > 0;
  const remaining = MAX_CHARS - content.length;

  useEffect(() => {
    listDepartments()
      .then(setDepartments)
      .catch(() => {});
    listDistricts()
      .then(setDistricts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setDistrictOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function removeMedia() {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value.slice(0, MAX_CHARS);
    setContent(val);

    const cursor = Math.min(e.target.selectionStart ?? val.length, val.length);
    const before = val.slice(0, cursor);
    const match = before.match(/@([^\s@]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[0].length);
    } else {
      setMentionQuery(null);
    }
  }

  function handleMentionSelect(
    type: "department" | "minister",
    item: { id: number; name: string; tag?: string },
  ) {
    const token = type === "department" ? item.name : (item.tag ?? item.name);
    const before = content.slice(0, mentionStart);
    const after = content.slice(mentionStart + 1 + (mentionQuery?.length ?? 0));
    const newContent = (before + "@" + token + " " + after).slice(0, MAX_CHARS);
    setContent(newContent);
    setMentionQuery(null);

    if (type === "department") {
      setSelectedDepartments((prev) =>
        prev.some((d) => d.id === item.id) ? prev : [...prev, { id: item.id, name: item.name }],
      );
    } else {
      setSelectedMinisters((prev) =>
        prev.some((m) => m.id === item.id) ? prev : [...prev, { id: item.id, name: item.name, tag: item.tag! }],
      );
    }

    textareaRef.current?.focus();
  }

  async function handlePost() {
    if (!heading.trim() || !content.trim() || loading) return;
    setLoading(true);
    try {
      let media_key: string | undefined;
      let media_type: "image" | "video" | undefined;

      if (mediaFile) {
        const fileType = mediaFile.type.startsWith("video/") ? "video" : "image";
        const { upload_url, key, content_type } = await postsApi.getMediaUploadUrl(fileType, mediaFile.type);
        await fetch(upload_url, {
          method: "PUT",
          body: mediaFile,
          headers: { "Content-Type": content_type },
        });
        media_key = key;
        media_type = fileType;
      }

      const post = await postsApi.createPost({
        heading: heading.trim(),
        content: content.trim(),
        ...(selectedDepartments.length > 0 ? { department_ids: selectedDepartments.map((d) => d.id) } : {}),
        ...(selectedMinisters.length > 0 ? { minister_ids: selectedMinisters.map((m) => m.id) } : {}),
        ...(district ? { district_id: district.id } : {}),
        ...(media_key ? { media_key, media_type } : {}),
      });

      setHeading("");
      setContent("");
      setSelectedDepartments([]);
      setSelectedMinisters([]);
      setDistrict(null);
      setMentionQuery(null);
      removeMedia();
      setFocused(false);
      onPostCreated(post);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to post.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <input
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Title"
        className="w-full outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-400"
      />

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (!content && !heading) setFocused(false);
          }}
          placeholder="What's on your mind? Type @ to tag a department or minister"
          rows={expanded ? 4 : 2}
          className="w-full resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 transition-all"
        />
        {mentionQuery !== null && (
          <MentionDropdown
            query={mentionQuery}
            departments={departments}
            onSelect={handleMentionSelect}
            onClose={() => setMentionQuery(null)}
          />
        )}
      </div>

      {mediaPreview && (
        <div className="relative w-fit">
          {mediaFile?.type.startsWith("video/") ? (
            <video src={mediaPreview} className="rounded-xl max-h-48 border border-gray-200" controls />
          ) : (
            <img src={mediaPreview} alt="" className="rounded-xl max-h-48 object-cover border border-gray-200" />
          )}
          <button
            onClick={removeMedia}
            className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-black/70"
          >
            ×
          </button>
        </div>
      )}

      {expanded && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedDepartments.map((dept) => (
              <div key={dept.id} className="flex items-center gap-1">
                <DepartmentBadge name={dept.name} />
                <button
                  onClick={() => setSelectedDepartments((prev) => prev.filter((d) => d.id !== dept.id))}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedMinisters.map((min) => (
              <div key={min.id} className="flex items-center gap-1">
                <MinisterBadge tag={min.tag} name={min.name} />
                <button
                  onClick={() => setSelectedMinisters((prev) => prev.filter((m) => m.id !== min.id))}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {district && (
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {district.name}
                </span>
                <button
                  onClick={() => setDistrict(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ×
                </button>
              </div>
            )}

            <div ref={districtRef} className="relative">
              <button
                onClick={() => { setDistrictOpen((v) => !v); setDistrictQuery(""); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C92A2A] bg-[#C92A2A]/8 hover:bg-[#C92A2A]/15 rounded px-3 py-1.5 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {district ? "Change location" : "Add location"}
              </button>
              {districtOpen && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 shrink-0">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                      </svg>
                      <input
                        autoFocus
                        value={districtQuery}
                        onChange={(e) => setDistrictQuery(e.target.value)}
                        placeholder="Search district…"
                        className="w-full text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto pb-2">
                    {districts
                      .filter((d) => d.name.toLowerCase().includes(districtQuery.toLowerCase()))
                      .map((d) => (
                        <button
                          key={d.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setDistrict(d); setDistrictOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 transition-colors ${
                            district?.id === d.id
                              ? "text-[#C92A2A] bg-[#C92A2A]/8 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 opacity-50">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {d.name}
                          {district?.id === d.id && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="ml-auto">
                              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      ))}
                    {districts.filter((d) => d.name.toLowerCase().includes(districtQuery.toLowerCase())).length === 0 && (
                      <p className="px-4 py-4 text-xs text-gray-400 text-center">No districts found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-gray-500 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 transition-colors"
            >
              {mediaFile ? "Change media" : "Add media"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs ${remaining < 50 ? "text-red-500" : "text-gray-400"}`}>
              {remaining}
            </span>
            <button
              onClick={handlePost}
              disabled={!heading.trim() || !content.trim() || loading || remaining < 0}
              className="px-4 py-1.5 bg-[#C92A2A] text-white text-sm rounded disabled:opacity-50 hover:bg-[#a82323] transition-colors"
            >
              {loading ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
