"use client";

import { useState, useEffect } from "react";
import { ministers as ministersApi } from "@/lib/api/ministers";
import type { Department } from "@/lib/api/departments";
import type { Minister } from "@/lib/api/types";

interface CreatePayload {
  name: string;
  minister_id?: number;
}

interface UpdatePayload {
  name?: string;
  minister_id?: number | null;
}

interface Props {
  department?: Department; // undefined = create mode
  onSave: (data: CreatePayload | UpdatePayload) => Promise<void>;
  onClose: () => void;
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

export function DepartmentFormModal({ department, onSave, onClose }: Props) {
  const isEdit = Boolean(department);
  const [name, setName] = useState(department?.name ?? "");
  const [ministerId, setMinisterId] = useState<string>(
    department?.minister ? String(department.minister.id) : "",
  );
  const [allMinisters, setAllMinisters] = useState<Minister[]>([]);
  const [loadingMinisters, setLoadingMinisters] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ministersApi
      .list()
      .then(setAllMinisters)
      .catch(() => {})
      .finally(() => setLoadingMinisters(false));
  }, []);

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
      if (isEdit) {
        const payload: UpdatePayload = { name: name.trim() };
        payload.minister_id = ministerId ? Number(ministerId) : null;
        await onSave(payload);
      } else {
        const payload: CreatePayload = { name: name.trim() };
        if (ministerId) payload.minister_id = Number(ministerId);
        await onSave(payload);
      }
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
          {isEdit ? "Edit Department" : "Add Department"}
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

          <Field label="Minister">
            {loadingMinisters ? (
              <div className="text-sm text-gray-400 py-2">Loading ministers…</div>
            ) : (
              <select
                value={ministerId}
                onChange={(e) => setMinisterId(e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {allMinisters.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name} ({m.dept})
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-400">
              The selected minister is automatically tagged on posts under this department.
            </p>
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
              disabled={loading || loadingMinisters}
              className="px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
