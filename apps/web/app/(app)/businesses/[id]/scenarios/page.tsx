"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GitCompare, Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import Link from "next/link";
import { ReportHistory } from "@/components/reports/report-history";

interface ScenarioResult {
  name: string;
  marketOpportunity: string;
  competitionLevel: "LOW" | "MEDIUM" | "HIGH";
  revenuePotential: string;
  customerAcquisitionCost: string;
  timeToRevenue: string;
  keyRisks: string[];
  keyAdvantages: string[];
  score: number;
}

interface ScenarioContent {
  question: string;
  recommendation: string;
  scenarios: ScenarioResult[];
  keyFactors: string[];
  nextSteps: string[];
}

const COMPETITION_COLOR: Record<string, string> = {
  LOW: "success", MEDIUM: "warning", HIGH: "danger",
};

export default function ScenariosPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState("");
  const [question, setQuestion] = useState("");
  const [scenarios, setScenarios] = useState(["", "", ""]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const api = useApiClient();

  useEffect(() => {
    params.then(({ id }) => setBusinessId(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateScenario = (i: number, v: string) =>
    setScenarios((prev) => prev.map((s, idx) => (idx === i ? v : s)));

  const addScenario = () => setScenarios((prev) => [...prev, ""]);
  const removeScenario = (i: number) => setScenarios((prev) => prev.filter((_, idx) => idx !== i));

  async function compare() {
    const filled = scenarios.filter((s) => s.trim());
    if (!question.trim()) { toast.error("Enter the decision question"); return; }
    if (filled.length < 2) { toast.error("Add at least 2 scenarios to compare"); return; }
    setLoading(true);
    try {
      const r = await api.post<Report>(`/businesses/${businessId}/strategy/scenarios`, {
        question,
        scenarios: filled,
      });
      setReport(r);
      toast.success("Comparison complete!");
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

  const c = report?.content as ScenarioContent | undefined;
  const best = c?.scenarios.reduce((a, b) => (b.score > a.score ? b : a), c.scenarios[0]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--page-fg)" }}>Scenario Comparison</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-fg)" }}>
            Compare markets, strategies, or options side-by-side before committing.
          </p>
        </div>
        <ReportHistory businessId={businessId} type="CUSTOM" activeReportId={report?.id} onSelect={selectReport} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Set up comparison</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>
              Decision question
            </label>
            <Input
              placeholder="e.g. Should we launch in the US, UK, or India first?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: "var(--muted-fg)" }}>
              Scenarios to compare
            </label>
            <div className="space-y-2">
              {scenarios.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Scenario ${i + 1} — e.g. Launch in India`}
                    value={s}
                    onChange={(e) => updateScenario(i, e.target.value)}
                    className="flex-1"
                  />
                  {scenarios.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => removeScenario(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {scenarios.length < 5 && (
              <button
                onClick={addScenario}
                className="mt-2 inline-flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "var(--accent)" }}
              >
                <Plus className="h-3.5 w-3.5" /> Add scenario
              </button>
            )}
          </div>
          <Button onClick={compare} loading={loading}>
            <GitCompare className="h-4 w-4" /> Compare scenarios
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner size="lg" />
          <p style={{ color: "var(--muted-fg)" }}>Comparing scenarios...</p>
        </div>
      )}

      {!loading && !report && (
        <div className="text-center py-16">
          <GitCompare className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--subtle-fg)" }} />
          <p style={{ color: "var(--muted-fg)" }}>Fill in the form above to generate a side-by-side comparison.</p>
        </div>
      )}

      {c && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Recommendation banner */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-indigo-400">Recommendation</p>
            <p className="text-sm" style={{ color: "var(--page-fg)" }}>{c.recommendation}</p>
          </div>

          {/* Scenario cards */}
          <div className={`grid gap-4 ${c.scenarios.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {c.scenarios.map((s) => (
              <Card
                key={s.name}
                style={s.name === best?.name ? { border: "1px solid rgba(99,102,241,.5)", background: "rgba(99,102,241,.05)" } : {}}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    {s.name === best?.name && (
                      <Badge variant="info">Top pick</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--line)" }}>
                      <div
                        className="h-1.5 rounded-full bg-indigo-500"
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>{s.score}/100</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <Row label="Market opportunity" value={s.marketOpportunity} />
                  <Row label="Competition" value={
                    <Badge variant={COMPETITION_COLOR[s.competitionLevel] as "success" | "warning" | "danger"}>{s.competitionLevel}</Badge>
                  } />
                  <Row label="Revenue potential" value={s.revenuePotential} />
                  <Row label="CAC estimate" value={s.customerAcquisitionCost} />
                  <Row label="Time to revenue" value={s.timeToRevenue} />

                  {s.keyAdvantages?.length > 0 && (
                    <div>
                      <p className="font-medium mb-1 text-emerald-400">Advantages</p>
                      <ul className="space-y-1">
                        {s.keyAdvantages.map((a, i) => (
                          <li key={i} className="flex gap-1.5" style={{ color: "var(--muted-fg)" }}>
                            <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {s.keyRisks?.length > 0 && (
                    <div>
                      <p className="font-medium mb-1 text-rose-400">Risks</p>
                      <ul className="space-y-1">
                        {s.keyRisks.map((r, i) => (
                          <li key={i} className="flex gap-1.5" style={{ color: "var(--muted-fg)" }}>
                            <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Key factors + next steps */}
          <div className="grid md:grid-cols-2 gap-4">
            {c.keyFactors?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Key decision factors</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {c.keyFactors.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--muted-fg)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {c.nextSteps?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Next steps</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {c.nextSteps.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--muted-fg)" }}>
                        <ArrowRight className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {report && (
            <div className="flex justify-end">
              <Link href={`/reports/${report.id}`}>
                <Button variant="outline" size="sm">View full report</Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span style={{ color: "var(--subtle-fg)" }}>{label}</span>
      <span className="text-right font-medium" style={{ color: "var(--page-fg)" }}>{value}</span>
    </div>
  );
}
