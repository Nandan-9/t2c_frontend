import { apiRequest } from "./client";
import type { PostAuthor } from "./posts";

export interface Comment {
  id: number;
  content: string;
  author: PostAuthor;
  created_at: string;
}

export const comments = {
  getComments(postId: number): Promise<Comment[]> {
    return apiRequest("GET", `/posts/${postId}/comments/`);
  },

  addComment(postId: number, content: string): Promise<Comment> {
    return apiRequest("POST", `/posts/${postId}/comments/`, { body: { content } });
  },

  deleteComment(postId: number, commentId: number): Promise<void> {
    return apiRequest("DELETE", `/posts/${postId}/comments/${commentId}/`);
  },
};
