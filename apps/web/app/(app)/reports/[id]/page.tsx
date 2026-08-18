"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Download, ArrowLeft, FileText } from "lucide-react";
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("PDF download failed");
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
