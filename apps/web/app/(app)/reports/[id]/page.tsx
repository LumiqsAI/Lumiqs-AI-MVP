"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Download, ArrowLeft, FileText, Share2, Link2, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import { REPORT_TYPE_LABELS, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_URL = `${BASE}/api/v1`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function s(v: unknown): string {
  return typeof v === "string" ? v : String(v ?? "");
}

function ListSection({ items, label }: { items: unknown; label: string }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {(items as unknown[]).map((item, i) => {
            if (typeof item === "string") {
              return (
                <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--muted-fg)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              );
            }
            if (typeof item === "object" && item !== null) {
              const obj = item as Record<string, unknown>;
              const title = s(obj.recommendation ?? obj.title ?? obj.name ?? "");
              const priority = obj.priority ? s(obj.priority) : null;
              const reason = obj.reason ? s(obj.reason) : null;
              return (
                <li key={i} className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                  {title && <p className="text-sm font-medium mb-1" style={{ color: "var(--page-fg)" }}>{title}</p>}
                  {reason && <p className="text-xs" style={{ color: "var(--muted-fg)" }}>Reason: {reason}</p>}
                  {priority && <Badge className="mt-1">{priority}</Badge>}
                </li>
              );
            }
            return null;
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function StrategySection({ item, label }: { item: Record<string, unknown>; label: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {Boolean(item.recommendation) && <p className="text-sm font-medium" style={{ color: "var(--page-fg)" }}>{s(item.recommendation)}</p>}
        {Boolean(item.reason) && <p className="text-xs" style={{ color: "var(--muted-fg)" }}>Reason: {s(item.reason)}</p>}
        {Boolean(item.expectedImpact) && <p className="text-xs" style={{ color: "var(--muted-fg)" }}>Impact: {s(item.expectedImpact)}</p>}
        {Boolean(item.implementationNotes) && <p className="text-xs" style={{ color: "var(--muted-fg)" }}>Implementation: {s(item.implementationNotes)}</p>}
      </CardContent>
    </Card>
  );
}

export default function ReportViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const [reportId, setReportId] = useState<string>("");
  const [report, setReport] = useState<Report & { shareToken?: string; isShared?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const api = useApiClient();
  const router = useRouter();

  useEffect(() => {
    params.then(async ({ id }) => {
      setReportId(id);
      try {
        const r = await api.get<Report & { shareToken?: string; isShared?: boolean }>(`/reports/${id}`);
        setReport(r);
      } catch {
        toast.error("Report not found");
        router.back();
      } finally {
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadPdf() {
    if (!report) return;
    setDownloading(true);
    try {
      const token = await api.getToken();
      const res = await fetch(`${API_URL}/reports/${reportId}/pdf`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(error?.error?.message || "Unable to generate the PDF. Please try again.");
      }
      const blob = await res.blob();
      if (!blob.size) throw new Error("The generated PDF was empty. Please try again.");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF download failed");
    } finally {
      setDownloading(false);
    }
  }

  async function toggleShare() {
    if (!report) return;
    setSharing(true);
    try {
      if (report.isShared) {
        const updated = await api.post<Report & { shareToken?: string; isShared?: boolean }>(`/reports/${reportId}/unshare`);
        setReport(updated);
        toast.success("Share link revoked");
      } else {
        const updated = await api.post<Report & { shareToken?: string; isShared?: boolean }>(`/reports/${reportId}/share`);
        setReport(updated);
        const link = `${APP_URL}/shared/${updated.shareToken}`;
        await navigator.clipboard.writeText(link).catch(() => {});
        toast.success("Share link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to update share settings");
    } finally {
      setSharing(false);
    }
  }

  async function copyShareLink() {
    if (!report?.shareToken) return;
    const link = `${APP_URL}/shared/${report.shareToken}`;
    await navigator.clipboard.writeText(link).catch(() => {});
    toast.success("Link copied!");
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  if (!report) return null;

  const content = report.content as Record<string, unknown> | null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold" style={{ color: "var(--page-fg)" }}>{report.title}</h1>
            <Badge variant="success">{REPORT_TYPE_LABELS[report.type]}</Badge>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--muted-fg)" }}>{formatDate(report.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {report.isShared && report.shareToken && (
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Link2 className="h-4 w-4" /> Copy link
            </Button>
          )}
          <Button
            variant={report.isShared ? "outline" : "outline"}
            size="sm"
            loading={sharing}
            onClick={toggleShare}
            style={report.isShared ? { borderColor: "rgba(99,102,241,.4)", color: "var(--accent)" } : {}}
          >
            <Share2 className="h-4 w-4" />
            {report.isShared ? "Shared" : "Share"}
          </Button>
          <Button onClick={downloadPdf} loading={downloading}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {report.isShared && report.shareToken && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)" }}
        >
          <LinkIcon className="h-4 w-4 text-indigo-400 shrink-0" />
          <span style={{ color: "var(--muted-fg)" }}>Anyone with the link can view this report.</span>
          <button
            onClick={copyShareLink}
            className="ml-auto text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Copy link
          </button>
        </div>
      )}

      {!content ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--subtle-fg)" }} />
          <p style={{ color: "var(--muted-fg)" }}>Report content not available.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {Boolean(content.executiveSummary) && (
            <Card>
              <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
              <CardContent><p className="leading-relaxed" style={{ color: "var(--muted-fg)" }}>{s(content.executiveSummary)}</p></CardContent>
            </Card>
          )}
          {Boolean(content.currentSituation) && (
            <Card>
              <CardHeader><CardTitle>Current Situation</CardTitle></CardHeader>
              <CardContent><p style={{ color: "var(--muted-fg)" }}>{s(content.currentSituation)}</p></CardContent>
            </Card>
          )}
          {Boolean(content.industryOverview) && (
            <Card>
              <CardHeader><CardTitle>Industry Overview</CardTitle></CardHeader>
              <CardContent><p style={{ color: "var(--muted-fg)" }}>{s(content.industryOverview)}</p></CardContent>
            </Card>
          )}
          <ListSection items={content.strengths} label="Strengths" />
          <ListSection items={content.weaknesses} label="Weaknesses" />
          <ListSection items={content.opportunities} label="Opportunities" />
          <ListSection items={content.risks} label="Risks" />
          <ListSection items={content.recommendations} label="Recommendations" />
          <ListSection items={content.priorityActions} label="Priority Actions" />
          <ListSection items={content.trends} label="Market Trends" />
          <ListSection items={content.customerPersonas} label="Customer Personas" />
          <ListSection items={content.monthlyGoals} label="Monthly Goals" />
          <ListSection items={content.successMetrics} label="Success Metrics" />
          {["revenueStrategy", "pricingStrategy", "marketingStrategy", "salesStrategy", "growthStrategy"].map((key) => {
            const item = content[key];
            if (!item || typeof item !== "object") return null;
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
            return <StrategySection key={key} item={item as Record<string, unknown>} label={label} />;
          })}
        </motion.div>
      )}
    </div>
  );
}

/*
 * Legacy duplicate retained in older working copies. The current report viewer
 * above contains the share-link UI and theme-aware presentation.
 */
/*
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_URL = `${BASE}/api/v1`;

function s(v: unknown): string {
  return typeof v === "string" ? v : String(v ?? "");
}

function ListSection({ items, label }: { items: unknown; label: string }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {(items as unknown[]).map((item, i) => {
            if (typeof item === "string") {
              return (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              );
            }
            if (typeof item === "object" && item !== null) {
              const obj = item as Record<string, unknown>;
              const title = s(obj.recommendation ?? obj.title ?? obj.name ?? "");
              const priority = obj.priority ? s(obj.priority) : null;
              const reason = obj.reason ? s(obj.reason) : null;
              return (
                <li key={i} className="p-3 rounded-lg bg-white/3 border border-white/8">
                  {title && <p className="text-sm font-medium text-white mb-1">{title}</p>}
                  {reason && <p className="text-xs text-slate-400">{"Reason: " + reason}</p>}
                  {priority && <Badge className="mt-1">{priority}</Badge>}
                </li>
              );
            }
            return null;
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function StrategySection({ item, label }: { item: Record<string, unknown>; label: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {Boolean(item.recommendation) && <p className="text-sm font-medium text-white">{s(item.recommendation)}</p>}
        {Boolean(item.reason) && <p className="text-xs text-slate-400">{"Reason: " + s(item.reason)}</p>}
        {Boolean(item.expectedImpact) && <p className="text-xs text-slate-400">{"Impact: " + s(item.expectedImpact)}</p>}
        {Boolean(item.implementationNotes) && <p className="text-xs text-slate-400">{"Implementation: " + s(item.implementationNotes)}</p>}
      </CardContent>
    </Card>
  );
}

export default function ReportViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const [reportId, setReportId] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const api = useApiClient();
  const router = useRouter();

  useEffect(() => {
    params.then(async ({ id }) => {
      setReportId(id);
      try {
        const r = await api.get<Report>(`/reports/${id}`);
        setReport(r);
      } catch {
        toast.error("Report not found");
        router.back();
      } finally {
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadPdf() {
    if (!report) return;
    setDownloading(true);
    try {
      const token = await api.getToken();
      const res = await fetch(`${API_URL}/reports/${reportId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(error?.error?.message || "Unable to generate the PDF. Please try again.");
      }
      const blob = await res.blob();
      if (!blob.size) throw new Error("The generated PDF was empty. Please try again.");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF download failed");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  if (!report) return null;

  const content = report.content as Record<string, unknown> | null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{report.title}</h1>
            <Badge variant="success">{REPORT_TYPE_LABELS[report.type]}</Badge>
          </div>
          <p className="text-slate-400 text-sm mt-1">{formatDate(report.createdAt)}</p>
        </div>
        <Button onClick={downloadPdf} loading={downloading}>
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      {!content ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">Report content not available.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {Boolean(content.executiveSummary) && (
            <Card>
              <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
              <CardContent><p className="text-slate-300 leading-relaxed">{s(content.executiveSummary)}</p></CardContent>
            </Card>
          )}
          {Boolean(content.currentSituation) && (
            <Card>
              <CardHeader><CardTitle>Current Situation</CardTitle></CardHeader>
              <CardContent><p className="text-slate-300">{s(content.currentSituation)}</p></CardContent>
            </Card>
          )}
          {Boolean(content.industryOverview) && (
            <Card>
              <CardHeader><CardTitle>Industry Overview</CardTitle></CardHeader>
              <CardContent><p className="text-slate-300">{s(content.industryOverview)}</p></CardContent>
            </Card>
          )}
          <ListSection items={content.strengths} label="Strengths" />
          <ListSection items={content.weaknesses} label="Weaknesses" />
          <ListSection items={content.opportunities} label="Opportunities" />
          <ListSection items={content.risks} label="Risks" />
          <ListSection items={content.recommendations} label="Recommendations" />
          <ListSection items={content.priorityActions} label="Priority Actions" />
          <ListSection items={content.trends} label="Market Trends" />
          <ListSection items={content.customerPersonas} label="Customer Personas" />
          <ListSection items={content.monthlyGoals} label="Monthly Goals" />
          <ListSection items={content.successMetrics} label="Success Metrics" />

          {["revenueStrategy", "pricingStrategy", "marketingStrategy", "salesStrategy", "growthStrategy"].map((key) => {
            const item = content[key];
            if (!item || typeof item !== "object") return null;
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
            return <StrategySection key={key} item={item as Record<string, unknown>} label={label} />;
          })}
        </motion.div>
      )}
    </div>
  );
}
*/
