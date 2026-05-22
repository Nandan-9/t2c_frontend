import { apiRequest } from "./client";
import type { Minister } from "./types";

export interface PostAuthor {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface Post {
  id: number;
  content: string;
  author: PostAuthor;
  minister: Minister | null;
  upvote_count: number;
  downvote_count: number;
  user_vote: "upvote" | "downvote" | null;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPosts {
  results: Post[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface VoteResult {
  upvote_count: number;
  downvote_count: number;
  user_vote: "upvote" | "downvote" | null;
}

export const posts = {
  getFeed(page = 1): Promise<PaginatedPosts> {
    return apiRequest("GET", `/posts/feed/?page=${page}`);
  },

  getPost(id: number): Promise<Post> {
    return apiRequest("GET", `/posts/${id}/`);
  },

  createPost(content: string, minister_id?: number): Promise<Post> {
    return apiRequest("POST", "/posts/", { body: { content, ...(minister_id ? { minister_id } : {}) } });
  },

  editPost(id: number, content: string): Promise<Post> {
    return apiRequest("PATCH", `/posts/${id}/`, { body: { content } });
  },

  deletePost(id: number): Promise<void> {
    return apiRequest("DELETE", `/posts/${id}/`);
  },

  castVote(postId: number, vote_type: "upvote" | "downvote"): Promise<VoteResult> {
    return apiRequest("POST", `/posts/${postId}/vote/`, { body: { vote_type } });
  },

  removeVote(postId: number, vote_type: "upvote" | "downvote"): Promise<void> {
    return apiRequest("DELETE", `/posts/${postId}/vote/`, { body: { vote_type } });
  },

  getPostsByMinister(ministerId: number): Promise<Post[]> {
    return apiRequest("GET", `/posts/minister/${ministerId}/`);
  },
};
