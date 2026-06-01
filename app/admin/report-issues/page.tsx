"use client";

import { useEffect, useState, useCallback } from "react";
import { reports } from "@/lib/api/reports";
import type { ReportIssue } from "@/lib/api/reports";

type Modal =
  | { type: "create" }
  | { type: "edit"; issue: ReportIssue }
  | { type: "delete"; issue: ReportIssue }
  | null;

export default function AdminReportIssuesPage() {
  const [list, setList] = useState<ReportIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal, setModal] = useState<Modal>(null);

  const load = useCallback(async () => {
    setFetchError("");
    try {
      const data = await reports.adminListReportIssues();
      setList(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Report Issues</h1>
          {!loading && !fetchError && (
            <p className="text-sm text-gray-400 mt-0.5">{list.length} issue{list.length !== 1 ? "s" : ""}</p>
          )}
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add issue
        </button>
      </div>

      {loading && <Spinner />}

      {fetchError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {fetchError}
        </p>
      )}

      {!loading && !fetchError && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {list.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No report issues yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Description</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((issue, i) => (
                  <tr
                    key={issue.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{issue.name}</td>
                    <td className="px-6 py-4 text-gray-500">{issue.description}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ type: "edit", issue })}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", issue })}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {(modal?.type === "create" || modal?.type === "edit") && (
        <IssueFormModal
          issue={modal.type === "edit" ? modal.issue : undefined}
          onSave={async (payload) => {
            if (modal.type === "edit") {
              await reports.updateReportIssue(modal.issue.id, payload);
            } else {
              await reports.createReportIssue(payload as { name: string; description: string });
            }
            await load();
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <ConfirmDelete
          name={modal.issue.name}
          onConfirm={async () => {
            await reports.deleteReportIssue(modal.issue.id);
            await load();
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function IssueFormModal({
  issue,
  onSave,
  onClose,
}: {
  issue?: ReportIssue;
  onSave: (payload: { name: string; description: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(issue?.name ?? "");
  const [description, setDescription] = useState(issue?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), description: description.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {issue ? "Edit issue" : "Add report issue"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spam"
              required
              autoFocus
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Unwanted or repetitive content"
              rows={3}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {saving ? "Saving…" : issue ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDelete({ name, onConfirm, onClose }: { name: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-5">
        <p className="text-base text-gray-700">
          Delete <span className="font-semibold">{name}</span>? This cannot be undone.
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={deleting}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
      </svg>
    </div>
  );
}
