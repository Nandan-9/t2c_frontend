import { apiRequest } from "./client";
import type { Minister } from "./types";

export interface Department {
  id: number;
  name: string;
  minister: Minister | null;
  created_at: string;
}

export interface TopDepartment {
  id: number;
  name: string;
  post_count: number;
}

export function listDepartments(): Promise<Department[]> {
  return apiRequest("GET", "/users/departments/", { auth: false });
}

export function getTopDepartments(): Promise<TopDepartment[]> {
  return apiRequest("GET", "/users/departments/top/", { auth: false });
}

export function createDepartment(payload: { name: string; minister_id?: number }): Promise<Department> {
  return apiRequest("POST", "/users/departments/", { body: payload });
}

export function updateDepartment(
  id: number,
  payload: { name?: string; minister_id?: number | null },
): Promise<Department> {
  return apiRequest("PATCH", `/users/departments/${id}/`, { body: payload });
}

export function deleteDepartment(id: number): Promise<void> {
  return apiRequest("DELETE", `/users/departments/${id}/`);
}
