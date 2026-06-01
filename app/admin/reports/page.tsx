"use client";

import { useEffect, useState, useCallback } from "react";
import { reports } from "@/lib/api/reports";
import type { AdminReportedPost, AdminReport } from "@/lib/api/reports";
import { RelativeTime } from "@/components/ui/RelativeTime";

type View =
  | { type: "list" }
  | { type: "detail"; postId: number; heading: string };

export default function AdminReportsPage() {
  const [view, setView] = useState<View>({ type: "list" });

  return view.type === "list"
    ? <ReportedPostsList onDrillIn={(postId, heading) => setView({ type: "detail", postId, heading })} />
    : <ReportDetail postId={view.postId} heading={view.heading} onBack={() => setView({ type: "list" })} />;
}

function ReportedPostsList({ onDrillIn }: { onDrillIn: (postId: number, heading: string) => void }) {
  const [list, setList] = useState<AdminReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reports.getAdminReportedPosts()
      .then(setList)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Reported Posts</h1>
        {!loading && !error && (
          <p className="text-sm text-gray-400 mt-0.5">{list.length} post{list.length !== 1 ? "s" : ""} reported</p>
        )}
      </div>

      {loading && <Spinner />}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {list.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No reports yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Post</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Author</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Issues</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-center">Reports</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Last reported</th>
                  <th className="px-6 py-3 font-medium text-gray-500" />
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => (
                  <tr
                    key={item.post_id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">{item.heading}</td>
                    <td className="px-6 py-4 text-gray-600">@{item.author.username}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.issues.map((issue) => (
                          <span
                            key={issue.id}
                            className="inline-block text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5"
                          >
                            {issue.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        {item.report_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <RelativeTime dateString={item.last_reported_at} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDrillIn(item.post_id, item.heading)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        View reports
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function ReportDetail({ postId, heading, onBack }: { postId: number; heading: string; onBack: () => void }) {
  const [list, setList] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await reports.getAdminReports({ post: postId });
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
          title="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800 truncate max-w-lg">{heading}</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400 mt-0.5">{list.length} report{list.length !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {loading && <Spinner />}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {list.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No reports found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Reporter</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Issue</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Reported</th>
                </tr>
              </thead>
              <tbody>
                {list.map((report, i) => (
                  <tr
                    key={report.id}
                    className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {report.reporter.avatar_url ? (
                          <img
                            src={report.reporter.avatar_url}
                            alt={report.reporter.username}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold shrink-0">
                            {report.reporter.username[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-gray-800">@{report.reporter.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{report.issue.name}</p>
                        <p className="text-xs text-gray-500">{report.issue.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <RelativeTime dateString={report.created_at} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
      </svg>
    </div>
  );
}
