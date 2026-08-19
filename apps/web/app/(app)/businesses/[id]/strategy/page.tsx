"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lightbulb, DollarSign, Megaphone, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import { PRIORITY_COLORS } from "@/lib/utils";
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
  { key: "revenueStrategy", label: "Revenue Strategy", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { key: "pricingStrategy", label: "Pricing Strategy", icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { key: "marketingStrategy", label: "Marketing Strategy", icon: Megaphone, color: "text-violet-400", bg: "bg-violet-400/10" },
  { key: "salesStrategy", label: "Sales Strategy", icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-400/10" },
  { key: "growthStrategy", label: "Growth Strategy", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
];

export default function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const api = useApiClient();

  useEffect(() => {
    params.then(({ id }) => setBusinessId(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true);
    try {
      const r = await api.post<Report>(`/businesses/${businessId}/strategy`);
      setReport(r);
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
  }

  const c = report?.content as StrategyContent | undefined;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Business Strategy</h1>
          <p className="text-slate-400 mt-1">Revenue, pricing, marketing, sales, and growth strategies.</p>
        </div>
        <div className="flex gap-2">
          <ReportHistory businessId={businessId} type="STRATEGY" activeReportId={report?.id} onSelect={selectReport} />
          {report && <Link href={`/reports/${report.id}`}><Button variant="outline">View Report</Button></Link>}
          <Button onClick={generate} loading={loading}><Lightbulb className="h-4 w-4" />{report ? "Regenerate" : "Generate Strategy"}</Button>
        </div>
      </div>

      {loading && <div className="flex flex-col items-center justify-center py-24 gap-4"><Spinner size="lg" /><p className="text-slate-400">Building your strategy...</p></div>}

      {!loading && !report && (
        <div className="text-center py-24">
          <Lightbulb className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">No strategy yet</h2>
          <p className="text-slate-400 mb-6">Generate a comprehensive business strategy covering all key areas.</p>
          <Button size="lg" onClick={generate}>Generate Strategy</Button>
        </div>
      )}

      {c && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {c.executiveSummary && (
            <Card>
              <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
              <CardContent><p className="text-slate-300 leading-relaxed">{c.executiveSummary}</p></CardContent>
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
                    <p className="text-sm font-medium text-white">{item.recommendation}</p>
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <p><span className="text-slate-500">Reason:</span> {item.reason}</p>
                      <p><span className="text-slate-500">Impact:</span> {item.expectedImpact}</p>
                      {item.implementationNotes && <p><span className="text-slate-500">Implementation:</span> {item.implementationNotes}</p>}
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
