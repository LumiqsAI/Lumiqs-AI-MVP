"use client";

import { useEffect, useRef, useState } from "react";
import { History } from "lucide-react";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";

interface ReportHistoryProps {
  businessId: string;
  type: Report["type"];
  activeReportId?: string;
  onSelect: (reportId: string) => void | Promise<void>;
}

export function ReportHistory({ businessId, type, activeReportId, onSelect }: ReportHistoryProps) {
  const api = useApiClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const onSelectRef = useRef(onSelect);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      try {
        const data = await api.get<{ items: Report[] }>(`/businesses/${businessId}/reports?limit=50`);
        const matching = data.items.filter((report) => report.type === type && report.status === "COMPLETED");
        if (cancelled) return;
        setReports(matching);
        if (!activeReportId && matching[0]) await onSelectRef.current(matching[0].id);
      } catch {
        if (!cancelled) setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadHistory();
    return () => { cancelled = true; };
  }, [api, businessId, type, activeReportId]);

  if (!businessId || (!loading && reports.length === 0)) return null;

  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-slate-400">
      <History className="h-3.5 w-3.5 text-indigo-300" />
      <span className="sr-only">Report history</span>
      <select
        aria-label="Report history"
        value={activeReportId || ""}
        disabled={loading}
        onChange={(event) => { if (event.target.value) void onSelectRef.current(event.target.value); }}
        className="max-w-40 bg-transparent text-xs text-slate-200 outline-none disabled:opacity-60"
      >
        {loading && <option>Loading history…</option>}
        {!loading && <option value="">Report history</option>}
        {reports.map((report) => (
          <option key={report.id} value={report.id}>
            {new Date(report.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </option>
        ))}
      </select>
    </label>
  );
}
