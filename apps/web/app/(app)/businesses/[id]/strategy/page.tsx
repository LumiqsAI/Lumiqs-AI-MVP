"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lightbulb, DollarSign, Megaphone, ShoppingCart, TrendingUp, History, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import { PRIORITY_COLORS, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ReportHistory } from "@/components/reports/report-history";

interface StrategyItem {
  recommendation: string;
  reason: string;
  priority: string;
  expectedImpact: string;
  implementationNotes: string;
}

interface StrategyContent {
  executiveSummary?: string;
  revenueStrategy?: StrategyItem;
  pricingStrategy?: StrategyItem;
  marketingStrategy?: StrategyItem;
  salesStrategy?: StrategyItem;
  growthStrategy?: StrategyItem;
}

const STRATEGY_CARDS = [
  { key: "revenueStrategy",   label: "Revenue Strategy",   icon: DollarSign,    color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { key: "pricingStrategy",   label: "Pricing Strategy",   icon: TrendingUp,    color: "text-indigo-400",  bg: "bg-indigo-400/10" },
  { key: "marketingStrategy", label: "Marketing Strategy", icon: Megaphone,     color: "text-violet-400",  bg: "bg-violet-400/10" },
  { key: "salesStrategy",     label: "Sales Strategy",     icon: ShoppingCart,  color: "text-amber-400",   bg: "bg-amber-400/10" },
  { key: "growthStrategy",    label: "Growth Strategy",    icon: TrendingUp,    color: "text-blue-400",    bg: "bg-blue-400/10" },
];

export default function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);
  const [versions, setVersions] = useState<Report[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [loading, setLoading] = useState(false);
  const api = useApiClient();

  useEffect(() => {
    params.then(({ id }) => setBusinessId(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!businessId) return;
    api.get<{ items: Report[] }>(`/businesses/${businessId}/reports?limit=50`)
      .then((r) => setVersions(r.items.filter((rep) => rep.type === "STRATEGY")))
      .catch(() => {});
  }, [businessId, api]);

  async function generate() {
    setLoading(true);
    try {
      const r = await api.post<Report>(`/businesses/${businessId}/strategy`);
      setReport(r);
      setVersions((prev) => [r, ...prev]);
      toast.success("Strategy generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function selectReport(reportId: string) {
    const selected = await api.get<Report>(`/reports/${reportId}`);
    setReport(selected);
    setShowVersions(false);
  }

  const c = report?.content as StrategyContent | undefined;
  const versionIndex = report ? versions.findIndex((v) => v.id === report.id) : -1;
  const versionLabel = versionIndex >= 0 ? `V${versions.length - versionIndex}` : null;

  return (
    <div className="w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:mx-0 2xl:mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--page-fg)" }}>Business Strategy</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-fg)" }}>Revenue, pricing, marketing, sales, and growth strategies.</p>
        </div>
        <div className="flex gap-2">
          {versions.length > 1 && (
            <Button variant="outline" onClick={() => setShowVersions(!showVersions)}>
              <History className="h-4 w-4" /> History ({versions.length})
            </Button>
          )}
          <ReportHistory businessId={businessId} type="STRATEGY" activeReportId={report?.id} onSelect={selectReport} />
          {report && <Link href={`/reports/${report.id}`}><Button variant="outline">View Report</Button></Link>}
          <Button onClick={generate} loading={loading}>
            <Lightbulb className="h-4 w-4" />{report ? "Regenerate" : "Generate Strategy"}
          </Button>
        </div>
      </div>

      {/* Version history panel */}
      {showVersions && versions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Strategy versions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {versions.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => selectReport(v.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors"
                    style={{
                      background: report?.id === v.id ? "var(--accent-subtle)" : "transparent",
                      border: report?.id === v.id ? "1px solid rgba(99,102,241,.3)" : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => { if (report?.id !== v.id) (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"; }}
                    onMouseLeave={(e) => { if (report?.id !== v.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"
                        style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                      >
                        V{versions.length - i}
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--page-fg)" }}>{v.title}</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted-fg)" }}>
                          <Clock className="h-3 w-3" /> {formatDate(v.createdAt)}
                        </p>
                      </div>
                    </div>
                    {i === 0 && <Badge variant="info">Latest</Badge>}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading && <div className="flex flex-col items-center justify-center py-24 gap-4"><Spinner size="lg" /><p style={{ color: "var(--muted-fg)" }}>Building your strategy...</p></div>}

      {!loading && !report && (
        <div className="text-center py-24">
          <Lightbulb className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--subtle-fg)" }} />
          <h2 className="text-lg font-medium mb-2" style={{ color: "var(--page-fg)" }}>No strategy yet</h2>
          <p className="mb-6" style={{ color: "var(--muted-fg)" }}>Generate a comprehensive business strategy covering all key areas.</p>
          <Button size="lg" onClick={generate}>Generate Strategy</Button>
        </div>
      )}

      {c && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {versionLabel && (
            <div className="flex items-center gap-2">
              <Badge variant="info">{versionLabel}</Badge>
              <span className="text-xs" style={{ color: "var(--muted-fg)" }}>
                {report && formatDate(report.createdAt)}
              </span>
            </div>
          )}

          {c.executiveSummary && (
            <Card>
              <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
              <CardContent><p className="leading-relaxed" style={{ color: "var(--muted-fg)" }}>{c.executiveSummary}</p></CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STRATEGY_CARDS.map(({ key, label, icon: Icon, color, bg }) => {
              const item = c[key as keyof StrategyContent] as StrategyItem | undefined;
              if (!item) return null;
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      {label}
                      <Badge className={`ml-auto ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.MEDIUM}`}>{item.priority}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-medium" style={{ color: "var(--page-fg)" }}>{item.recommendation}</p>
                    <div className="space-y-1.5 text-xs" style={{ color: "var(--muted-fg)" }}>
                      <p><span style={{ color: "var(--subtle-fg)" }}>Reason:</span> {item.reason}</p>
                      <p><span style={{ color: "var(--subtle-fg)" }}>Impact:</span> {item.expectedImpact}</p>
                      {item.implementationNotes && <p><span style={{ color: "var(--subtle-fg)" }}>Implementation:</span> {item.implementationNotes}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
