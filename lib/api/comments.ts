import { apiRequest } from "./client";
import type { PostAuthor } from "./posts";

export interface Comment {
  id: number;
  author: PostAuthor;
  content: string;
  created_at: string;
  replies: Comment[];
}

export const comments = {
  getComments(postId: number): Promise<Comment[]> {
    return apiRequest("GET", `/posts/${postId}/comments/`);
  },

  addComment(postId: number, content: string, parent_id?: number): Promise<Comment> {
    const body = parent_id != null ? { content, parent_id } : { content };
    return apiRequest("POST", `/posts/${postId}/comments/`, { body });
  },

  deleteComment(postId: number, commentId: number): Promise<void> {
    return apiRequest("DELETE", `/posts/${postId}/comments/${commentId}/`);
  },
};
