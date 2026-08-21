"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Rocket, CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Report, ExecutionTask } from "@/types";
import { PRIORITY_COLORS } from "@/lib/utils";
import Link from "next/link";
import { ReportHistory } from "@/components/reports/report-history";

interface WeekData {
  week: number;
  focus: string;
  tasks: Array<{ title: string; description?: string; priority?: string; outcome?: string }>;
}

interface ExecutionContent {
  executiveSummary?: string;
  monthlyGoals?: string[];
  milestones?: Array<{ title: string; description: string; targetDate: string; successMetric: string }>;
  weeks?: WeekData[];
  successMetrics?: string[];
}

export default function ExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [loading, setLoading] = useState(false);
  const api = useApiClient();

  useEffect(() => {
    params.then(({ id }) => setBusinessId(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true);
    try {
      const r = await api.post<Report>(`/businesses/${businessId}/execution-plan`);
      setReport(r);
      const t = await api.get<ExecutionTask[]>(`/businesses/${businessId}/execution-plan/${r.id}/tasks`);
      setTasks(t);
      toast.success("Execution plan ready!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(taskId: string, status: ExecutionTask["status"]) {
    try {
      await api.patch(`/businesses/${businessId}/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    } catch {
      toast.error("Failed to update task");
    }
  }

  async function selectReport(reportId: string) {
    const selected = await api.get<Report>(`/reports/${reportId}`);
    const selectedTasks = await api.get<ExecutionTask[]>(`/businesses/${businessId}/execution-plan/${reportId}/tasks`);
    setReport(selected);
    setTasks(selectedTasks);
  }

  const c = report?.content as ExecutionContent | undefined;
  const weeks = [1, 2, 3, 4];

  const StatusIcon = ({ status }: { status: ExecutionTask["status"] }) => {
    if (status === "DONE") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (status === "IN_PROGRESS") return <Clock className="h-4 w-4 text-amber-400" />;
    return <Circle className="h-4 w-4 text-slate-600" />;
  };

  return (
    <div className="w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:mx-0 2xl:mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Execution Plan</h1>
          <p className="text-slate-400 mt-1">Week-by-week roadmap with tasks and success metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ReportHistory businessId={businessId} type="EXECUTION" activeReportId={report?.id} onSelect={selectReport} />
          {report && <Link href={`/reports/${report.id}`}><Button variant="outline">View Report</Button></Link>}
          <Button onClick={generate} loading={loading}><Rocket className="h-4 w-4" />{report ? "Regenerate" : "Generate Plan"}</Button>
        </div>
      </div>

      {loading && <div className="flex flex-col items-center justify-center py-24 gap-4"><Spinner size="lg" /><p className="text-slate-400">Building your execution plan...</p></div>}

      {!loading && !report && (
        <div className="text-center py-24">
          <Rocket className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">No execution plan yet</h2>
          <p className="text-slate-400 mb-6">Generate a 4-week execution roadmap with specific tasks and priorities.</p>
          <Button size="lg" onClick={generate}>Generate Plan</Button>
        </div>
      )}

      {c && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {c.executiveSummary && (
            <Card>
              <CardHeader><CardTitle>Plan Overview</CardTitle></CardHeader>
              <CardContent><p className="text-slate-300">{c.executiveSummary}</p></CardContent>
            </Card>
          )}

          {c.monthlyGoals?.length && (
            <Card>
              <CardHeader><CardTitle>Monthly Goals</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{c.monthlyGoals.map((g, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">{i + 1}</span>{g}</li>)}</ul>
              </CardContent>
            </Card>
          )}

          {/* Weekly roadmap */}
          <div className="space-y-4">
            {weeks.map((week) => {
              const weekTasks = tasks.filter((t) => t.week === week);
              const weekData = c.weeks?.find((w) => w.week === week);
              if (!weekTasks.length && !weekData) return null;
              const done = weekTasks.filter((t) => t.status === "DONE").length;
              return (
                <Card key={week}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Week {week}{weekData?.focus ? ` — ${weekData.focus}` : ""}</span>
                      {weekTasks.length > 0 && (
                        <span className="text-xs font-normal text-slate-400">{done}/{weekTasks.length} done</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {weekTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/8 group">
                        <button onClick={() => updateStatus(task.id, task.status === "DONE" ? "TODO" : task.status === "TODO" ? "IN_PROGRESS" : "DONE")} className="mt-0.5 flex-shrink-0">
                          <StatusIcon status={task.status} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-slate-500" : "text-white"}`}>{task.title}</p>
                          {task.description && <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>}
                          {task.outcome && <p className="text-xs text-slate-500 mt-0.5">Outcome: {task.outcome}</p>}
                        </div>
                        <Badge className={PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM}>{task.priority}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {c.successMetrics?.length && (
            <Card>
              <CardHeader><CardTitle>Success Metrics</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{c.successMetrics.map((m, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />{m}</li>)}</ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
