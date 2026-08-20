"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import Link from "next/link";
import { ReportHistory } from "@/components/reports/report-history";
import { CompetitorPositioningMap } from "@/components/business/competitor-positioning-map";

interface CompetitorContent {
  overview?: string;
  businessModel?: string;
  targetAudience?: string;
  pricing?: string;
  features?: string[];
  positioning?: string;
  strengths?: string[];
  weaknesses?: string[];
  swot?: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  competitiveAdvantages?: string[];
  threats?: string[];
  recommendations?: string[];
}

interface AnalyzedCompetitor {
  name: string;
  content: Record<string, unknown>;
}

export default function CompetitorsPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState<string>("");
  const [businessName, setBusinessName] = useState("Your Business");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState<AnalyzedCompetitor[]>([]);
  const api = useApiClient();

  useEffect(() => {
    params.then(({ id }) => {
      setBusinessId(id);
      api.get<{ name: string }>(`/businesses/${id}`)
        .then((b) => setBusinessName(b.name))
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function analyze() {
    if (!name.trim()) { toast.error("Competitor name required"); return; }
    setLoading(true);
    try {
      const r = await api.post<Report>(`/businesses/${businessId}/competitors/analyze`, { competitorName: name, website });
      setReport(r);
      // Add to positioning map if not already present
      setAnalyzed((prev) => {
        const exists = prev.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (exists) return prev;
        return [...prev, { name, content: (r.content ?? {}) as Record<string, unknown> }];
      });
      toast.success("Analysis complete!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function selectReport(reportId: string) {
    const selected = await api.get<Report>(`/reports/${reportId}`);
    setReport(selected);
    const selectedName = selected.title.replace(/^Competitor Analysis:\s*/, "");
    setName(selectedName);
    setWebsite("");
    setAnalyzed((prev) => {
      const exists = prev.find((c) => c.name.toLowerCase() === selectedName.toLowerCase());
      if (exists) return prev;
      return [...prev, { name: selectedName, content: (selected.content ?? {}) as Record<string, unknown> }];
    });
  }

  const c = report?.content as CompetitorContent | undefined;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold" style={{ color: "var(--page-fg)" }}>Competitor Analysis</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-fg)" }}>Analyze competitors and identify strategic advantages.</p>
        </div>
        <ReportHistory businessId={businessId} type="COMPETITOR_ANALYSIS" activeReportId={report?.id} onSelect={selectReport} />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex gap-3">
            <Input placeholder="Competitor name (e.g. Notion, Stripe)" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            <Input placeholder="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} className="flex-1" />
            <Button onClick={analyze} loading={loading}><Plus className="h-4 w-4" />Analyze</Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner size="lg" />
          <p style={{ color: "var(--muted-fg)" }}>Analyzing competitor...</p>
        </div>
      )}

      {!loading && !report && (
        <div className="text-center py-16">
          <Users2 className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--subtle-fg)" }} />
          <p style={{ color: "var(--muted-fg)" }}>Enter a competitor name above to generate a competitive analysis.</p>
        </div>
      )}

      {/* Positioning map — shown once 2+ competitors are analyzed */}
      {analyzed.length >= 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <CompetitorPositioningMap businessName={businessName} competitors={analyzed} />
        </motion.div>
      )}

      {c && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "var(--page-fg)" }}>{name}</h2>
            <div className="flex gap-2">
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5" />Website</Button>
                </a>
              )}
              {report && (
                <Link href={`/reports/${report.id}`}>
                  <Button variant="outline" size="sm">View Report</Button>
                </Link>
              )}
            </div>
          </div>

          {c.overview && (
            <Card>
              <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
              <CardContent><p style={{ color: "var(--muted-fg)" }}>{c.overview}</p></CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {c.businessModel && (
              <Card><CardContent className="pt-5">
                <p className="text-xs mb-1" style={{ color: "var(--subtle-fg)" }}>Business Model</p>
                <p className="text-sm" style={{ color: "var(--page-fg)" }}>{c.businessModel}</p>
              </CardContent></Card>
            )}
            {c.targetAudience && (
              <Card><CardContent className="pt-5">
                <p className="text-xs mb-1" style={{ color: "var(--subtle-fg)" }}>Target Audience</p>
                <p className="text-sm" style={{ color: "var(--page-fg)" }}>{c.targetAudience}</p>
              </CardContent></Card>
            )}
            {c.pricing && (
              <Card><CardContent className="pt-5">
                <p className="text-xs mb-1" style={{ color: "var(--subtle-fg)" }}>Pricing</p>
                <p className="text-sm" style={{ color: "var(--page-fg)" }}>{c.pricing}</p>
              </CardContent></Card>
            )}
          </div>

          {c.swot && (
            <Card>
              <CardHeader><CardTitle>SWOT Analysis</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {[
                  { key: "strengths",    label: "Strengths",    color: "text-emerald-400" },
                  { key: "weaknesses",   label: "Weaknesses",   color: "text-red-400" },
                  { key: "opportunities",label: "Opportunities", color: "text-amber-400" },
                  { key: "threats",      label: "Threats",      color: "text-orange-400" },
                ].map(({ key, label, color }) => (
                  <div key={key} className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <p className={`text-xs font-medium ${color} mb-2`}>{label}</p>
                    <ul className="space-y-1">
                      {(c.swot![key as keyof typeof c.swot] || []).map((item: string, i: number) => (
                        <li key={i} className={`text-xs flex items-start gap-1.5 ${color.replace("text-", "text-")}`} style={{ color: "var(--muted-fg)" }}>
                          <span className={`w-1 h-1 rounded-full ${color.replace("text-", "bg-")} mt-1.5 flex-shrink-0`} />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {c.recommendations?.length && (
            <Card>
              <CardHeader><CardTitle>Strategic Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {c.recommendations.map((r, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--muted-fg)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
