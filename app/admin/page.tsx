"use client";

import { useEffect, useState, useCallback } from "react";
import { ministers as ministersApi } from "@/lib/api/ministers";
import type { CreateMinisterPayload, Minister, UpdateMinisterPayload } from "@/lib/api/types";
import { MinisterFormModal } from "@/components/admin/MinisterFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";

type Modal =
  | { type: "create" }
  | { type: "edit"; minister: Minister }
  | { type: "delete"; minister: Minister }
  | null;

export default function AdminMinistersPage() {
  const [list, setList] = useState<Minister[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal, setModal] = useState<Modal>(null);

  const loadMinisters = useCallback(async () => {
    setFetchError("");
    try {
      const data = await ministersApi.list();
      setList(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load ministers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMinisters();
  }, [loadMinisters]);

  async function handleCreate(payload: CreateMinisterPayload | UpdateMinisterPayload) {
    await ministersApi.create(payload as CreateMinisterPayload);
    await loadMinisters();
  }

  async function handleEdit(payload: CreateMinisterPayload | UpdateMinisterPayload) {
    if (modal?.type !== "edit") return;
    await ministersApi.update(modal.minister.id, payload);
    await loadMinisters();
  }

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    await ministersApi.delete(modal.minister.id);
    await loadMinisters();
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Ministers</h1>
          <p className="text-sm text-gray-400 mt-0.5">{list.length} total</p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add minister
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
            <div className="py-16 text-center text-gray-400 text-sm">No ministers yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Department</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Constituency</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Tag</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m, i) => (
                  <tr
                    key={m.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {m.avatar_url ? (
                          <img
                            src={m.avatar_url}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0">
                            {m.name[0]}
                          </div>
                        )}
                        <span className="font-medium text-gray-800">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{m.dept}</td>
                    <td className="px-6 py-4 text-gray-600">{m.constituency}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {m.tag}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ type: "edit", minister: m })}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", minister: m })}
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

      {modal?.type === "create" && (
        <MinisterFormModal onSave={handleCreate} onClose={() => setModal(null)} />
      )}

      {modal?.type === "edit" && (
        <MinisterFormModal
          minister={modal.minister}
          onSave={handleEdit}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <ConfirmDeleteModal
          name={modal.minister.name}
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
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
