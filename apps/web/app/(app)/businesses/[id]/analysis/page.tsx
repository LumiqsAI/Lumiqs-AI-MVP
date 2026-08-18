"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import { PRIORITY_COLORS } from "@/lib/utils";
import Link from "next/link";

interface AnalysisContent {
  executiveSummary?: string;
  currentSituation?: string;
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  risks?: string[];
  recommendations?: Array<{ recommendation: string; reason: string; priority: string; expectedImpact: string; implementationNotes: string }>;
  priorityActions?: string[];
}

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const api = useApiClient();

  useEffect(() => {
    params.then(({ id }) => setBusinessId(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    if (!businessId) return;
    setLoading(true);
    try {
      const r = await api.post<Report>(`/businesses/${businessId}/analysis`);
      setReport(r);
      toast.success("Analysis complete!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const content = report?.content as AnalysisContent | undefined;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Business Analysis</h1>
          <p className="text-slate-400 mt-1">AI-powered SWOT analysis and strategic recommendations.</p>
        </div>
        <div className="flex gap-2">
          {report && (
            <Link href={`/reports/${report.id}`}>
              <Button variant="outline">View Report</Button>
            </Link>
          )}
          <Button onClick={generate} loading={loading}>
            <BarChart3 className="h-4 w-4" /> {report ? "Regenerate" : "Generate Analysis"}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner size="lg" />
          <p className="text-slate-400">Analyzing your business...</p>
        </div>
      )}

      {!loading && !report && (
        <div className="text-center py-24">
          <BarChart3 className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">No analysis yet</h2>
          <p className="text-slate-400 mb-6">Generate a comprehensive business analysis with SWOT, recommendations, and priority actions.</p>
          <Button size="lg" onClick={generate}>Generate Analysis</Button>
        </div>
      )}

      {content && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {content.executiveSummary && (
            <Card>
              <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
              <CardContent><p className="text-slate-300 leading-relaxed">{content.executiveSummary}</p></CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "strengths", label: "Strengths", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", variant: "success" as const },
              { key: "weaknesses", label: "Weaknesses", icon: TrendingDown, color: "text-red-400", bg: "bg-red-400/10", variant: "danger" as const },
              { key: "opportunities", label: "Opportunities", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-400/10", variant: "warning" as const },
              { key: "risks", label: "Risks", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10", variant: "danger" as const },
            ].map(({ key, label, icon: Icon, color, bg, variant }) => {
              const items = content[key as keyof AnalysisContent] as string[] | undefined;
              if (!items?.length) return null;
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className={`w-1.5 h-1.5 rounded-full ${color.replace("text-", "bg-")} mt-1.5 flex-shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {content.recommendations?.length && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4 text-indigo-400" />Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {content.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/3 border border-white/8">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-white">{rec.recommendation}</p>
                      <Badge className={PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.MEDIUM}>{rec.priority}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-1"><span className="text-slate-500">Reason:</span> {rec.reason}</p>
                    <p className="text-xs text-slate-400"><span className="text-slate-500">Impact:</span> {rec.expectedImpact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {content.priorityActions?.length && (
            <Card>
              <CardHeader><CardTitle>Priority Actions</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {content.priorityActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">{i + 1}</span>
                      {action}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
