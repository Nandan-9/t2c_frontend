import { apiRequest } from "./client";
import type { District } from "./types";

export type { District };

export interface DistrictPostCount {
  id: number;
  name: string;
  post_count: number;
}

export function getDistrictPostCounts(): Promise<DistrictPostCount[]> {
  return apiRequest("GET", "/users/districts/post-count/", { auth: false });
}

export function listDistricts(): Promise<District[]> {
  return apiRequest("GET", "/users/districts/", { auth: false });
}

export function getDistrict(id: number): Promise<District> {
  return apiRequest("GET", `/users/districts/${id}/`, { auth: false });
}

export function createDistrict(payload: { name: string }): Promise<District> {
  return apiRequest("POST", "/users/districts/", { body: payload });
}

export function updateDistrict(id: number, payload: { name: string }): Promise<District> {
  return apiRequest("PATCH", `/users/districts/${id}/`, { body: payload });
}

export function deleteDistrict(id: number): Promise<void> {
  return apiRequest("DELETE", `/users/districts/${id}/`);
}
