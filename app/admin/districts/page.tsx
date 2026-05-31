"use client";

import { useEffect, useState, useCallback } from "react";
import {
  listDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "@/lib/api/districts";
import type { District } from "@/lib/api/districts";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";

type Modal =
  | { type: "create" }
  | { type: "edit"; district: District }
  | { type: "delete"; district: District }
  | null;

export default function AdminDistrictsPage() {
  const [list, setList] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal, setModal] = useState<Modal>(null);

  const loadDistricts = useCallback(async () => {
    setFetchError("");
    try {
      const data = await listDistricts();
      setList(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load districts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    await deleteDistrict(modal.district.id);
    await loadDistricts();
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Districts</h1>
          <p className="text-sm text-gray-400 mt-0.5">{list.length} total</p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add district
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {fetchError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {fetchError}
        </p>
      )}

      {!loading && !fetchError && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {list.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No districts yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((district, i) => (
                  <tr
                    key={district.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{district.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ type: "edit", district })}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", district })}
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
        <DistrictFormModal
          district={modal.type === "edit" ? modal.district : undefined}
          onSave={async (payload) => {
            if (modal.type === "edit") {
              await updateDistrict(modal.district.id, payload);
            } else {
              await createDistrict(payload);
            }
            await loadDistricts();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <ConfirmDeleteModal
          name={modal.district.name}
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function DistrictFormModal({
  district,
  onSave,
  onClose,
}: {
  district?: District;
  onSave: (payload: { name: string }) => Promise<void>;
  onClose: () => void;
}) {
  const isEdit = Boolean(district);
  const [name, setName] = useState(district?.name ?? "");
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
      await onSave({ name: name.trim() });
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Edit District" : "Add District"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Thiruvananthapuram"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full"
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
              className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add district"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-6 w-6 text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
    </svg>
  );
}
