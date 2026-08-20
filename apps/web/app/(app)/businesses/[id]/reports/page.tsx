"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileText, Download, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner, EmptyState } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import { REPORT_TYPE_LABELS, formatDate } from "@/lib/utils";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_URL = `${BASE}/api/v1`;

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState<string>("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApiClient();

  useEffect(() => {
    params.then(({ id }) => {
      setBusinessId(id);
      loadReports(id);
    });
  }, []);

  async function loadReports(bid: string) {
    try {
      const data = await api.get<{ items: Report[] }>(`/businesses/${bid}/reports`);
      setReports(data.items);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  async function deleteReport(id: string) {
    try {
      await api.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function downloadPdf(reportId: string, title: string) {
    try {
      const { getToken } = api;
      const token = await getToken();
      const res = await fetch(`${API_URL}/reports/${reportId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  }

  return (
    <div className="w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:mx-0 2xl:mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
        <p className="text-slate-400 mt-1">All generated reports for this business.</p>
      </div>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!loading && !reports.length && (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No reports yet"
          description="Generate analysis, market research, strategy, or execution plans to create reports."
        />
      )}

      {!loading && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="hover:border-white/15 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{r.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(r.createdAt)}</p>
                    {r.summary && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{r.summary}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={r.status === "COMPLETED" ? "success" : r.status === "FAILED" ? "danger" : "warning"}>
                      {REPORT_TYPE_LABELS[r.type]}
                    </Badge>
                    {r.status === "COMPLETED" && (
                      <>
                        <Link href={`/reports/${r.id}`}>
                          <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => downloadPdf(r.id, r.title)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteReport(r.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
