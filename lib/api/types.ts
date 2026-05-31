export interface Minister {
  id: number;
  name: string;
  dept: string;
  constituency: string;
  avatar_url: string | null;
  tag: string;
  created_at: string;
  total_posts: number;
  departments: { id: number; name: string }[];
}

export interface CreateMinisterPayload {
  name: string;
  dept: string;
  constituency: string;
  avatar_url?: string;
}

export interface UpdateMinisterPayload {
  name?: string;
  dept?: string;
  constituency?: string;
  avatar_url?: string;
}

export interface Follow {
  id: number;
  minister: Minister;
  followed_at: string;
}

export interface Follower {
  user_id: number;
  email: string;
  username: string;
  followed_at: string;
}

export interface TagResult {
  id: number;
  name: string;
  tag: string;
}

export interface District {
  id: number;
  name: string;
}
