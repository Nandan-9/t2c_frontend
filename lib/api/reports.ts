import { apiRequest } from "./client";
import type { PostAuthor } from "./posts";

export interface ReportIssue {
  id: number;
  name: string;
  description: string;
}

export interface ReportResponse {
  id: number;
  issue: ReportIssue;
  created_at: string;
}

export interface AdminReport {
  id: number;
  post: {
    id: number;
    heading: string;
    author: PostAuthor;
  };
  reporter: PostAuthor & { avatar_url: string };
  issue: ReportIssue;
  created_at: string;
}

export interface AdminReportedPost {
  post_id: number;
  heading: string;
  author: PostAuthor;
  report_count: number;
  last_reported_at: string;
  issues: Pick<ReportIssue, "id" | "name">[];
}

export const reports = {
  getReportIssues(): Promise<ReportIssue[]> {
    return apiRequest("GET", "/posts/report-issues/");
  },

  reportPost(
    postId: number,
    payload: { issue_id: number; description?: string } | { description: string },
  ): Promise<ReportResponse> {
    return apiRequest("POST", `/posts/${postId}/report/`, { body: payload });
  },

  getAdminReports(filters?: { issue?: number; post?: number }): Promise<AdminReport[]> {
    const p = new URLSearchParams();
    if (filters?.issue != null) p.set("issue", String(filters.issue));
    if (filters?.post != null) p.set("post", String(filters.post));
    const qs = p.toString();
    return apiRequest("GET", `/posts/admin/reports/${qs ? `?${qs}` : ""}`);
  },

  getAdminReportedPosts(): Promise<AdminReportedPost[]> {
    return apiRequest("GET", "/posts/admin/reported-posts/");
  },

  adminListReportIssues(): Promise<ReportIssue[]> {
    return apiRequest("GET", "/posts/admin/report-issues/");
  },

  createReportIssue(payload: { name: string; description: string }): Promise<ReportIssue> {
    return apiRequest("POST", "/posts/admin/report-issues/", { body: payload });
  },

  updateReportIssue(id: number, payload: { name?: string; description?: string }): Promise<ReportIssue> {
    return apiRequest("PATCH", `/posts/admin/report-issues/${id}/`, { body: payload });
  },

  deleteReportIssue(id: number): Promise<void> {
    return apiRequest("DELETE", `/posts/admin/report-issues/${id}/`);
  },
};
