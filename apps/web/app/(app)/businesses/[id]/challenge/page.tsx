"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Swords, ArrowRight, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report } from "@/types";
import Link from "next/link";
import { ReportHistory } from "@/components/reports/report-history";

interface Assumption {
  assumption: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  explanation: string;
}

interface Experiment {
  hypothesis: string;
  howToTest: string;
  timeframe: string;
  successSignal: string;
}

interface ChallengeContent {
  strategyStatement: string;
  overallVerdict: "STRONG" | "NEEDS_WORK" | "RISKY";
  verdictSummary: string;
  assumptions: Assumption[];
  weakPoints: string[];
  strengths: string[];
  experiments: Experiment[];
  alternativesToConsider: string[];
  nextSteps: string[];
}

const VERDICT_STYLE: Record<string, { label: string; variant: "success" | "warning" | "danger"; border: string; bg: string }> = {
  STRONG:     { label: "Strong",      variant: "success", border: "rgba(52,211,153,.3)",  bg: "rgba(52,211,153,.06)" },
  NEEDS_WORK: { label: "Needs Work",  variant: "warning", border: "rgba(251,191,36,.3)",  bg: "rgba(251,191,36,.06)" },
  RISKY:      { label: "Risky",       variant: "danger",  border: "rgba(251,113,133,.3)", bg: "rgba(251,113,133,.06)" },
};

const RISK_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  LOW: "success", MEDIUM: "warning", HIGH: "danger",
};

export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState("");
  const [statement, setStatement] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const api = useApiClient();

  useEffect(() => {
    params.then(({ id }) => setBusinessId(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function challenge() {
    if (!statement.trim()) { toast.error("Enter your strategy statement"); return; }
    setLoading(true);
    try {
      const r = await api.post<Report>(`/businesses/${businessId}/strategy/challenge`, {
        strategyStatement: statement,
      });
      setReport(r);
      toast.success("Challenge complete!");
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

  const c = report?.content as ChallengeContent | undefined;
  const verdict = c ? VERDICT_STYLE[c.overallVerdict] : null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--page-fg)" }}>Challenge My Strategy</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-fg)" }}>
            State your strategy. Lumiqs will stress-test it — assumptions, risks, weak points, and experiments to run.
          </p>
        </div>
        <ReportHistory businessId={businessId} type="CUSTOM" activeReportId={report?.id} onSelect={selectReport} />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-5 space-y-4">
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>
              Your strategy statement
            </label>
            <Textarea
              placeholder={`e.g. "I'm going to target US startups at $99/month with a self-serve SaaS model and grow through content marketing."`}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={challenge} loading={loading}>
            <Swords className="h-4 w-4" /> Challenge this strategy
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner size="lg" />
          <p style={{ color: "var(--muted-fg)" }}>Stress-testing your strategy...</p>
        </div>
      )}

      {!loading && !report && (
        <div className="text-center py-16">
          <Swords className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--subtle-fg)" }} />
          <p style={{ color: "var(--muted-fg)" }}>
            Describe your strategy above and Lumiqs will challenge every assumption before you commit.
          </p>
        </div>
      )}

      {c && verdict && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Verdict banner */}
          <div
            className="rounded-xl p-4"
            style={{ border: `1px solid ${verdict.border}`, background: verdict.bg }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={verdict.variant}>{verdict.label}</Badge>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--subtle-fg)" }}>
                Overall verdict
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--page-fg)" }}>{c.verdictSummary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            {c.strengths?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-emerald-400">Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {c.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--muted-fg)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Weak points */}
            {c.weakPoints?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-rose-400">Weak Points</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {c.weakPoints.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--muted-fg)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />{w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Assumptions */}
          {c.assumptions?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Hidden Assumptions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {c.assumptions.map((a, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3"
                    style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium" style={{ color: "var(--page-fg)" }}>{a.assumption}</p>
                      <Badge variant={RISK_VARIANT[a.risk]}>{a.risk}</Badge>
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted-fg)" }}>{a.explanation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Experiments */}
          {c.experiments?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-indigo-400" /> Experiments to run before committing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {c.experiments.map((e, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-4 space-y-2"
                    style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
                  >
                    <p className="text-sm font-medium" style={{ color: "var(--page-fg)" }}>{e.hypothesis}</p>
                    <div className="grid sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <p style={{ color: "var(--subtle-fg)" }}>How to test</p>
                        <p style={{ color: "var(--muted-fg)" }}>{e.howToTest}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--subtle-fg)" }}>Timeframe</p>
                        <p style={{ color: "var(--muted-fg)" }}>{e.timeframe}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--subtle-fg)" }}>Success signal</p>
                        <p style={{ color: "var(--muted-fg)" }}>{e.successSignal}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Alternatives */}
            {c.alternativesToConsider?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Alternatives to consider</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {c.alternativesToConsider.map((a, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--muted-fg)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Next steps */}
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
