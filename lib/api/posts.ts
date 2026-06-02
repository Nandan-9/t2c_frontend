import { apiRequest } from "./client";
import type { Minister } from "./types";

export interface PostAuthor {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface PostDetailComment {
  id: number;
  author: PostAuthor;
  content: string;
  created_at: string;
}

export interface Post {
  id: number;
  heading: string;
  content: string;
  author: PostAuthor;
  departments: { id: number; name: string }[];
  ministers: Minister[];
  district: { id: number; name: string } | null;
  status: "published" | "archived" | "draft" | "deleted";
  media_url: string | null;
  media_type: "image" | "video" | null;
  upvote_count: number;
  downvote_count: number;
  user_vote: "upvote" | "downvote" | null;
  can_edit: boolean;
  comment_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PostDetail extends Post {
  comments: PostDetailComment[];
}

// feed / trending: cursor = upvote_count + id
export interface FeedPage {
  results: Post[];
  next_cursor_upvote_count: number | null;
  next_cursor_id: number | null;
}

// latest: cursor = created_at + id
export interface LatestPage {
  results: Post[];
  next_cursor_created_at: string | null;
  next_cursor_id: number | null;
}

// ministers feed: cursor = upvote_count + created_at + id
export interface MinistersPage {
  results: Post[];
  next_cursor_upvote_count: number | null;
  next_cursor_created_at: string | null;
  next_cursor_id: number | null;
}

export interface VoteResult {
  id: number;
  vote_type: "upvote" | "downvote";
}

export interface MediaUploadUrl {
  upload_url: string;
  key: string;
  content_type: string;
  expires_in: number;
  max_size_bytes: number;
}

function qs(params: Record<string, string | number>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const posts = {
  getFeed(cursor?: { cursor_upvote_count?: number; cursor_id?: number }): Promise<FeedPage> {
    const params = cursor?.cursor_id != null
      ? qs({ cursor_upvote_count: cursor.cursor_upvote_count ?? 0, cursor_id: cursor.cursor_id })
      : "";
    return apiRequest("GET", `/posts/feed/${params}`);
  },

  getTrending(cursor?: { cursor_upvote_count?: number; cursor_id?: number }): Promise<FeedPage> {
    const params = cursor?.cursor_id != null
      ? qs({ cursor_upvote_count: cursor.cursor_upvote_count ?? 0, cursor_id: cursor.cursor_id })
      : "";
    return apiRequest("GET", `/posts/trending/${params}`);
  },

  getLatest(cursor?: { cursor_created_at?: string; cursor_id?: number }): Promise<LatestPage> {
    const params = cursor?.cursor_id != null && cursor.cursor_created_at
      ? qs({ cursor_created_at: cursor.cursor_created_at, cursor_id: cursor.cursor_id })
      : "";
    return apiRequest("GET", `/posts/latest/${params}`);
  },

  getPostsByMinisters(
    ids: number[],
    cursor?: { cursor_upvote_count?: number; cursor_created_at?: string; cursor_id?: number },
  ): Promise<MinistersPage> {
    const p = new URLSearchParams({ ids: ids.join(",") });
    if (cursor?.cursor_id != null) {
      if (cursor.cursor_upvote_count != null) p.set("cursor_upvote_count", String(cursor.cursor_upvote_count));
      if (cursor.cursor_created_at) p.set("cursor_created_at", cursor.cursor_created_at);
      p.set("cursor_id", String(cursor.cursor_id));
    }
    return apiRequest("GET", `/posts/ministers/?${p.toString()}`);
  },

  getPost(id: number): Promise<PostDetail> {
    return apiRequest("GET", `/posts/${id}/`);
  },

  createPost(params: {
    heading: string;
    content: string;
    department_ids?: number[];
    minister_ids?: number[];
    district_id?: number;
    media_key?: string;
    media_type?: "image" | "video";
  }): Promise<Post> {
    return apiRequest("POST", "/posts/", { body: params });
  },

  editPost(
    id: number,
    params: { heading?: string; content?: string; status?: "published" | "archived" | "draft" },
  ): Promise<Post> {
    return apiRequest("PATCH", `/posts/${id}/`, { body: params });
  },

  deletePost(id: number): Promise<void> {
    return apiRequest("DELETE", `/posts/${id}/`);
  },

  getMediaUploadUrl(media_type: "image" | "video", content_type: string): Promise<MediaUploadUrl> {
    return apiRequest("POST", "/posts/media/upload-url/", { body: { media_type, content_type } });
  },

  castVote(postId: number, vote_type: "upvote" | "downvote"): Promise<VoteResult> {
    return apiRequest("POST", `/posts/${postId}/vote/`, { body: { vote_type } });
  },

  removeVote(postId: number, vote_type: "upvote" | "downvote"): Promise<void> {
    return apiRequest("DELETE", `/posts/${postId}/vote/`, { body: { vote_type } });
  },
};
