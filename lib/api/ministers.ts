import { apiRequest } from "./client";
import type {
  CreateMinisterPayload,
  Follow,
  Follower,
  Minister,
  TagResult,
  UpdateMinisterPayload,
} from "./types";

export const ministers = {
  list(): Promise<Minister[]> {
    return apiRequest("GET", "/users/ministers/");
  },

  get(id: number): Promise<Minister> {
    return apiRequest("GET", `/users/ministers/${id}/`);
  },

  create(payload: CreateMinisterPayload): Promise<Minister> {
    return apiRequest("POST", "/users/ministers/", { body: payload });
  },

  update(id: number, payload: UpdateMinisterPayload): Promise<Minister> {
    return apiRequest("PATCH", `/users/ministers/${id}/`, { body: payload });
  },

  delete(id: number): Promise<void> {
    return apiRequest("DELETE", `/users/ministers/${id}/`);
  },

  follow(id: number): Promise<Follow> {
    return apiRequest("POST", `/users/ministers/${id}/follow/`);
  },

  unfollow(id: number): Promise<void> {
    return apiRequest("DELETE", `/users/ministers/${id}/follow/`);
  },

  followers(id: number): Promise<Follower[]> {
    return apiRequest("GET", `/users/ministers/${id}/followers/`);
  },

  searchTags(query: string): Promise<TagResult[]> {
    const q = encodeURIComponent(query);
    return apiRequest("GET", `/users/ministers/tags/?q=${q}`);
  },
};

export const me = {
  following(): Promise<Follow[]> {
    return apiRequest("GET", "/users/me/following/");
  },
};

export function searchMinisterTags(q: string): Promise<TagResult[]> {
  return apiRequest("GET", `/users/ministers/tags/?q=${encodeURIComponent(q)}`);
}

export function followMinister(id: number): Promise<Follow> {
  return apiRequest("POST", `/users/ministers/${id}/follow/`);
}

export function unfollowMinister(id: number): Promise<void> {
  return apiRequest("DELETE", `/users/ministers/${id}/follow/`);
}

export function getMyFollowing(): Promise<Follow[]> {
  return apiRequest("GET", "/users/me/following/");
}
