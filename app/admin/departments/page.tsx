"use client";

import { useEffect, useState, useCallback } from "react";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/lib/api/departments";
import type { Department } from "@/lib/api/departments";
import { DepartmentFormModal } from "@/components/admin/DepartmentFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";

type Modal =
  | { type: "create" }
  | { type: "edit"; department: Department }
  | { type: "delete"; department: Department }
  | null;

export default function AdminDepartmentsPage() {
  const [list, setList] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal, setModal] = useState<Modal>(null);

  const loadDepartments = useCallback(async () => {
    setFetchError("");
    try {
      const data = await listDepartments();
      setList(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  type CreatePayload = Parameters<typeof createDepartment>[0];
  type UpdatePayload = Parameters<typeof updateDepartment>[1];

  async function handleCreate(payload: CreatePayload | UpdatePayload) {
    await createDepartment(payload as CreatePayload);
    await loadDepartments();
  }

  async function handleEdit(payload: CreatePayload | UpdatePayload) {
    if (modal?.type !== "edit") return;
    await updateDepartment(modal.department.id, payload as UpdatePayload);
    await loadDepartments();
  }

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    await deleteDepartment(modal.department.id);
    await loadDepartments();
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Departments</h1>
          <p className="text-sm text-gray-400 mt-0.5">{list.length} total</p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add department
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
            <div className="py-16 text-center text-gray-400 text-sm">No departments yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Minister</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((dept, i) => (
                  <tr
                    key={dept.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{dept.name}</td>
                    <td className="px-6 py-4">
                      {dept.minister ? (
                        <div className="flex items-center gap-2">
                          {dept.minister.avatar_url ? (
                            <img
                              src={dept.minister.avatar_url}
                              alt={dept.minister.name}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0">
                              {dept.minister.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-gray-800">{dept.minister.name}</p>
                            <p className="text-xs text-gray-400">{dept.minister.tag}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ type: "edit", department: dept })}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", department: dept })}
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
        <DepartmentFormModal onSave={handleCreate} onClose={() => setModal(null)} />
      )}

      {modal?.type === "edit" && (
        <DepartmentFormModal
          department={modal.department}
          onSave={handleEdit}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <ConfirmDeleteModal
          name={modal.department.name}
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
