"use client";

import { useState, useEffect } from "react";
import { reports } from "@/lib/api/reports";
import type { ReportIssue } from "@/lib/api/reports";
import { useToast } from "@/hooks/useToast";

interface Props {
  postId: number;
  onClose: () => void;
}

export function ReportModal({ postId, onClose }: Props) {
  const { showToast } = useToast();
  const [issues, setIssues] = useState<ReportIssue[]>([]);
  const [text, setText] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<ReportIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    reports.getReportIssues()
      .then(setIssues)
      .catch(() => setError("Failed to load report options."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleChip(issue: ReportIssue) {
    setSelectedIssue(issue);
    setText(issue.name);
    setError("");
  }

  function handleTextChange(val: string) {
    setText(val);
    if (selectedIssue && val !== selectedIssue.name) setSelectedIssue(null);
    setError("");
  }

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = selectedIssue
        ? { issue_id: selectedIssue.id }
        : { description: trimmed };
      await reports.reportPost(postId, payload);
      showToast("Post reported", "success");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit report.";
      setError(msg.includes("already reported") ? "You've already reported this post." : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Report post</h2>
          <p className="text-sm text-gray-500 mt-0.5">Choose an option or describe the issue.</p>
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Describe the issue…"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C92A2A]/30 focus:border-[#C92A2A]"
          autoFocus
        />

        {loading ? (
          <div className="flex justify-center py-2">
            <svg className="animate-spin h-5 w-5 text-[#C92A2A]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {issues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => handleChip(issue)}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  selectedIssue?.id === issue.id
                    ? "bg-[#C92A2A] text-white border-[#C92A2A]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#C92A2A] hover:text-[#C92A2A]"
                }`}
              >
                {issue.name}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="px-4 py-2 text-sm text-white bg-[#C92A2A] rounded-lg hover:bg-[#a82323] disabled:opacity-40 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}
