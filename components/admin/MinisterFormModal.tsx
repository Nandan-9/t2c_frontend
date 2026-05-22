"use client";

import { useState, useEffect } from "react";
import type { CreateMinisterPayload, Minister, UpdateMinisterPayload } from "@/lib/api/types";

interface Props {
  minister?: Minister; // undefined = create mode
  onSave: (data: CreateMinisterPayload | UpdateMinisterPayload) => Promise<void>;
  onClose: () => void;
}

export function MinisterFormModal({ minister, onSave, onClose }: Props) {
  const isEdit = Boolean(minister);
  const [name, setName] = useState(minister?.name ?? "");
  const [dept, setDept] = useState(minister?.dept ?? "");
  const [constituency, setConstituency] = useState(minister?.constituency ?? "");
  const [avatarUrl, setAvatarUrl] = useState(minister?.avatar_url ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: CreateMinisterPayload = { name, dept, constituency };
      if (avatarUrl.trim()) payload.avatar_url = avatarUrl.trim();
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Edit Minister" : "Add Minister"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name" required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Department" required>
            <input
              type="text"
              required
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Constituency" required>
            <input
              type="text"
              required
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Avatar URL">
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add minister"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
