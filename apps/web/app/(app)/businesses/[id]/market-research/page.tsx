"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Globe, Users, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import Link from "next/link";
import { ReportHistory } from "@/components/reports/report-history";

interface MarketContent {
  industryOverview?: string;
  marketSize?: string;
  marketGrowth?: string;
  customerPersonas?: Array<{ name: string; description: string; painPoints: string[]; goals: string[] }>;
  painPoints?: string[];
  trends?: string[];
  opportunities?: string[];
  risks?: string[];
  recommendations?: string[];
}

export default function MarketResearchPage({ params }: { params: Promise<{ id: string }> }) {
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
      const r = await api.post<Report>(`/businesses/${businessId}/market-research`);
      setReport(r);
      toast.success("Market research complete!");
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

  const c = report?.content as MarketContent | undefined;

  return (
    <div className="w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:mx-0 2xl:mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Market Research</h1>
          <p className="text-slate-400 mt-1">Industry overview, customer personas, trends, and opportunities.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ReportHistory businessId={businessId} type="MARKET_RESEARCH" activeReportId={report?.id} onSelect={selectReport} />
          {report && <Link href={`/reports/${report.id}`}><Button variant="outline">View Report</Button></Link>}
          <Button onClick={generate} loading={loading}><Globe className="h-4 w-4" />{report ? "Regenerate" : "Generate Research"}</Button>
        </div>
      </div>

      {loading && <div className="flex flex-col items-center justify-center py-24 gap-4"><Spinner size="lg" /><p className="text-slate-400">Researching your market...</p></div>}

      {!loading && !report && (
        <div className="text-center py-24">
          <Globe className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">No research yet</h2>
          <p className="text-slate-400 mb-6">Generate market research including industry overview, customer personas, and opportunities.</p>
          <Button size="lg" onClick={generate}>Generate Research</Button>
        </div>
      )}

      {c && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {(c.industryOverview || c.marketSize || c.marketGrowth) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {c.industryOverview && (
                <Card className="md:col-span-3">
                  <CardHeader><CardTitle>Industry Overview</CardTitle></CardHeader>
                  <CardContent><p className="text-slate-300 leading-relaxed">{c.industryOverview}</p></CardContent>
                </Card>
              )}
              {c.marketSize && (
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-xs text-slate-500 mb-1">Market Size</p>
                    <p className="text-sm font-medium text-white">{c.marketSize}</p>
                  </CardContent>
                </Card>
              )}
              {c.marketGrowth && (
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-xs text-slate-500 mb-1">Market Growth</p>
                    <p className="text-sm font-medium text-white">{c.marketGrowth}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {c.customerPersonas?.length && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-indigo-400" />Customer Personas</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {c.customerPersonas.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/3 border border-white/8">
                    <h4 className="font-medium text-white mb-2">{p.name}</h4>
                    <p className="text-xs text-slate-400 mb-3">{p.description}</p>
                    {p.painPoints?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-slate-500 mb-1">Pain Points</p>
                        <ul className="space-y-1">{p.painPoints.map((pp, j) => <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />{pp}</li>)}</ul>
                      </div>
                    )}
                    {p.goals?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Goals</p>
                        <ul className="space-y-1">{p.goals.map((g, j) => <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />{g}</li>)}</ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "trends", label: "Market Trends", icon: TrendingUp, color: "text-indigo-400" },
              { key: "opportunities", label: "Opportunities", icon: Lightbulb, color: "text-amber-400" },
              { key: "risks", label: "Risks", icon: AlertTriangle, color: "text-red-400" },
              { key: "recommendations", label: "Recommendations", icon: Lightbulb, color: "text-emerald-400" },
            ].map(({ key, label, icon: Icon, color }) => {
              const items = c[key as keyof MarketContent] as string[] | undefined;
              if (!items?.length) return null;
              return (
                <Card key={key}>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} />{label}</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">{items.map((item, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className={`w-1.5 h-1.5 rounded-full ${color.replace("text-", "bg-")} mt-1.5 flex-shrink-0`} />{item}</li>)}</ul>
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
