"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, FileText, Bot, Plus, ArrowRight, TrendingUp,
  Sparkles, Compass, Search, Rocket, Zap,
  AlertCircle, CheckCircle2, Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardData } from "@/types";
import { formatRelativeTime, REPORT_TYPE_LABELS, STAGE_LABELS } from "@/lib/utils";
import { useApiClient } from "@/lib/api/client";

const PLAN_LABELS: Record<string, string> = { explorer: "Explorer", founder: "Founder", studio: "Studio", custom: "Custom" };
const PLAN_BADGE: Record<string, "default" | "success" | "info"> = { explorer: "default", founder: "success", studio: "info", custom: "info" };

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

interface Signal {
  icon: React.ReactNode;
  label: string;
  action: string;
  href: string;
  type: "alert" | "suggestion" | "next";
}

function buildSignals(data: DashboardData | null, plan: string | null): Signal[] {
  const signals: Signal[] = [];
  const firstBiz = data?.businesses[0];

  if (!firstBiz) {
    signals.push({
      icon: <Lightbulb className="h-4 w-4" />,
      label: "No business workspace yet",
      action: "Create your first workspace to start analysis",
      href: "/businesses/new",
      type: "next",
    });
    return signals;
  }

  // No reports yet
  if (!data?.recentReports.length) {
    signals.push({
      icon: <Lightbulb className="h-4 w-4" />,
      label: "No analysis run yet",
      action: "Recommended next action: Run a business analysis",
      href: `/businesses/${firstBiz.id}/analysis`,
      type: "next",
    });
  }

  // Has reports but no competitor analysis
  const hasCompetitor = data?.recentReports.some((r) => r.type === "COMPETITOR_ANALYSIS");
  if (data?.recentReports.length && !hasCompetitor) {
    signals.push({
      icon: <AlertCircle className="h-4 w-4" />,
      label: "Competitor landscape not mapped",
      action: "Analyze at least one competitor to validate positioning",
      href: `/businesses/${firstBiz.id}/competitors`,
      type: "alert",
    });
  }

  // Has analysis but no strategy
  const hasStrategy = data?.recentReports.some((r) => r.type === "STRATEGY");
  const hasAnalysis = data?.recentReports.some((r) => r.type === "BUSINESS_ANALYSIS");
  if (hasAnalysis && !hasStrategy) {
    signals.push({
      icon: <Lightbulb className="h-4 w-4" />,
      label: "Strategy not defined",
      action: "Recommended next action: Build a strategy from your analysis",
      href: `/businesses/${firstBiz.id}/strategy`,
      type: "suggestion",
    });
  }

  // Has strategy but no execution plan
  const hasExecution = data?.recentReports.some((r) => r.type === "EXECUTION");
  if (hasStrategy && !hasExecution) {
    signals.push({
      icon: <Rocket className="h-4 w-4" />,
      label: "No execution plan yet",
      action: "Recommended next action: Convert strategy into weekly priorities",
      href: `/businesses/${firstBiz.id}/execution`,
      type: "next",
    });
  }

  // Explorer plan nudge
  if (plan === "explorer" && data?.recentReports.length && data.recentReports.length >= 1) {
    signals.push({
      icon: <Zap className="h-4 w-4" />,
      label: "Explorer plan limit approaching",
      action: "Upgrade to Founder for unlimited analysis and competitor tracking",
      href: "/pricing",
      type: "alert",
    });
  }

  // All good
  if (signals.length === 0) {
    signals.push({
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: "Workspace is active",
      action: "Ask your AI consultant a new decision question",
      href: `/businesses/${firstBiz.id}/ai`,
      type: "next",
    });
  }

  return signals.slice(0, 3);
}

const SIGNAL_STYLES: Record<Signal["type"], { border: string; bg: string; icon: string }> = {
  alert:      { border: "rgba(251,113,133,.25)", bg: "rgba(251,113,133,.06)", icon: "text-rose-400" },
  suggestion: { border: "rgba(251,191,36,.25)",  bg: "rgba(251,191,36,.06)",  icon: "text-amber-400" },
  next:       { border: "rgba(99,102,241,.25)",  bg: "rgba(99,102,241,.06)",  icon: "text-indigo-400" },
};

export function DashboardClient({ initialData }: { initialData: DashboardData | null }) {
  const { user } = useUser();
  const api = useApiClient();
  const [plan, setPlan] = useState<string | null>(null);
  const data = initialData;

  useEffect(() => {
    api.get<{ plan: string }>("/users/plan").then((r) => setPlan(r.plan)).catch(() => {});
  }, [api]);

  const firstName = user?.firstName || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const signals = buildSignals(data, plan);

  return (
    <div className="relative w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:mx-0 2xl:mx-auto">
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)", filter: "blur(60px)", opacity: 0.6 }}
      />

      {/* ── Header ── */}
      <motion.div {...fadeUp} className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ border: "1px solid var(--accent-glow)", background: "var(--accent-subtle)", color: "var(--accent)" }}
          >
            <Sparkles className="h-3 w-3" /> Intelligence workspace
          </span>
          {plan && <Badge variant={PLAN_BADGE[plan]}>{PLAN_LABELS[plan]} plan</Badge>}
          {plan === "explorer" && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ border: "1px solid var(--accent-glow)", background: "var(--accent-subtle)", color: "var(--accent)" }}
            >
              <Zap className="h-3 w-3" /> Upgrade
            </Link>
          )}
        </div>

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--page-fg)", letterSpacing: "-0.03em" }}>
              {greeting}, {firstName}.
            </h1>
            <p className="mt-2 max-w-lg text-base" style={{ color: "var(--muted-fg)" }}>
              Here's what needs your attention and what to do next.
            </p>
          </div>
          <Link href="/businesses/new">
            <Button><Plus className="h-4 w-4" /> New business</Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Decision signals ── */}
      <motion.div {...fadeUp} transition={{ delay: 0.04 }} className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em]" style={{ color: "var(--subtle-fg)" }}>
          Signals &amp; next actions
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {signals.map((signal) => {
            const s = SIGNAL_STYLES[signal.type];
            return (
              <Link
                key={signal.label}
                href={signal.href}
                className="group flex flex-col gap-2 rounded-xl p-4 transition-all"
                style={{ border: `1px solid ${s.border}`, background: s.bg }}
              >
                <span className={`flex items-center gap-2 text-xs font-semibold ${s.icon}`}>
                  {signal.icon} {signal.label}
                </span>
                <span className="text-xs leading-5" style={{ color: "var(--muted-fg)" }}>{signal.action}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent)" }}>
                  Take action <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div {...fadeUp} transition={{ delay: 0.07 }} className="mb-8 grid gap-3 md:grid-cols-3">
        {[
          { icon: Compass, title: "Ask your consultant", text: "Pressure-test a decision with business context.", href: data?.businesses[0] ? `/businesses/${data.businesses[0].id}/ai` : "/businesses/new" },
          { icon: Search,  title: "Explore a market",   text: "Turn uncertainty into a focused research brief.", href: data?.businesses[0] ? `/businesses/${data.businesses[0].id}/market-research` : "/businesses/new" },
          { icon: Rocket,  title: "Build momentum",     text: "Convert a strategy into this month's priorities.", href: data?.businesses[0] ? `/businesses/${data.businesses[0].id}/execution` : "/businesses/new" },
        ].map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group flex items-start gap-3 rounded-xl p-4 transition-all"
            style={{ border: "1px solid var(--line)", background: "var(--card-bg)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,70,229,0.25)";
              (e.currentTarget as HTMLElement).style.background = "var(--accent-subtle)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
              (e.currentTarget as HTMLElement).style.background = "var(--card-bg)";
            }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
              <action.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--page-fg)" }}>
                {action.title}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" style={{ color: "var(--subtle-fg)" }} />
              </span>
              <span className="mt-1 block text-xs leading-5" style={{ color: "var(--muted-fg)" }}>{action.text}</span>
            </span>
          </Link>
        ))}
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Businesses */}
        <motion.div {...fadeUp} transition={{ delay: 0.10 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Your Businesses</CardTitle>
              <Link href="/businesses/new">
                <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" /> New</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!data?.businesses.length ? (
                <div className="text-center py-10">
                  <Building2 className="h-7 w-7 mx-auto mb-3" style={{ color: "var(--subtle-fg)" }} />
                  <p className="text-sm" style={{ color: "var(--muted-fg)" }}>No businesses yet</p>
                  <Link href="/businesses/new" className="mt-4 inline-block">
                    <Button size="sm">Create your first business</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.businesses.map((b) => (
                    <Link
                      key={b.id}
                      href={`/businesses/${b.id}/ai`}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors group"
                      style={{ color: "inherit" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0"
                          style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                        >
                          {b.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--page-fg)" }}>{b.name}</p>
                          <p className="text-xs" style={{ color: "var(--muted-fg)" }}>{b.industry || "No industry"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{STAGE_LABELS[b.stage]}</Badge>
                        <ArrowRight className="h-3.5 w-3.5 transition-colors" style={{ color: "var(--subtle-fg)" }} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reports */}
        <motion.div {...fadeUp} transition={{ delay: 0.13 }}>
          <Card>
            <CardHeader className="pb-3"><CardTitle>Recent Reports</CardTitle></CardHeader>
            <CardContent>
              {!data?.recentReports.length ? (
                <div className="text-center py-10">
                  <TrendingUp className="h-7 w-7 mx-auto mb-3" style={{ color: "var(--subtle-fg)" }} />
                  <p className="text-sm" style={{ color: "var(--muted-fg)" }}>No reports yet. Generate your first analysis.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.recentReports.map((r) => (
                    <Link
                      key={r.id}
                      href={`/reports/${r.id}`}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors group"
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--page-fg)" }}>{r.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-fg)" }}>
                          {r.business.name} · {formatRelativeTime(r.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.status === "COMPLETED" ? "success" : r.status === "FAILED" ? "danger" : "warning"}>
                          {REPORT_TYPE_LABELS[r.type]}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--subtle-fg)" }} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Conversations */}
        <motion.div {...fadeUp} transition={{ delay: 0.17 }} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3"><CardTitle>Recent AI Conversations</CardTitle></CardHeader>
            <CardContent>
              {!data?.recentConversations.length ? (
                <div className="text-center py-10">
                  <Bot className="h-7 w-7 mx-auto mb-3" style={{ color: "var(--subtle-fg)" }} />
                  <p className="text-sm" style={{ color: "var(--muted-fg)" }}>No conversations yet. Start chatting with your AI consultant.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.recentConversations.map((c) => (
                    <Link
                      key={c.id}
                      href={`/businesses/${c.businessId}/ai?conversation=${c.id}`}
                      className="p-3.5 rounded-xl transition-colors group"
                      style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,70,229,0.2)";
                        (e.currentTarget as HTMLElement).style.background = "var(--accent-subtle)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                        (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-1" style={{ color: "var(--page-fg)" }}>{c.title}</p>
                        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--subtle-fg)" }} />
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--muted-fg)" }}>
                        {c.business.name} · {formatRelativeTime(c.updatedAt)}
                      </p>
                      {c.messages?.[0] && (
                        <p className="text-xs mt-1.5 line-clamp-1" style={{ color: "var(--subtle-fg)" }}>{c.messages[0].content}</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
