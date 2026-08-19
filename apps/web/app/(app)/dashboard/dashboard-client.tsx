"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Building2, FileText, Bot, Plus, ArrowRight, TrendingUp, Sparkles, Compass, Search, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardData } from "@/types";
import { formatRelativeTime, REPORT_TYPE_LABELS, STAGE_LABELS } from "@/lib/utils";

export function DashboardClient({ initialData }: { initialData: DashboardData | null }) {
  const { user } = useUser();
  const data = initialData;

  const firstName = user?.firstName || "there";

  return (
    <div className="relative mx-auto max-w-6xl p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-indigo-300"><Sparkles className="h-3.5 w-3.5" /> Decision workspace</span><span>Today&apos;s view</span></div>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h1 className="text-3xl font-semibold tracking-tight text-white">Good morning, {firstName}.</h1><p className="mt-2 max-w-xl text-slate-400">A clear view of your businesses, decisions, and the next useful move.</p></div><Link href="/businesses/new"><Button><Plus className="h-4 w-4" /> New business</Button></Link></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="mb-8 grid gap-3 md:grid-cols-3">
        {[
          { icon: Compass, title: "Ask your consultant", text: "Pressure-test a decision with business context.", href: data?.businesses[0] ? `/businesses/${data.businesses[0].id}/ai` : "/businesses/new" },
          { icon: Search, title: "Explore a market", text: "Turn uncertainty into a focused research brief.", href: data?.businesses[0] ? `/businesses/${data.businesses[0].id}/market-research` : "/businesses/new" },
          { icon: Rocket, title: "Build momentum", text: "Convert a strategy into this month's priorities.", href: data?.businesses[0] ? `/businesses/${data.businesses[0].id}/execution` : "/businesses/new" },
        ].map((action) => <Link key={action.title} href={action.href} className="group flex items-start gap-3 border border-white/10 bg-white/[.025] p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-300/30 hover:bg-indigo-300/[.06]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300"><action.icon className="h-4 w-4" /></span><span className="min-w-0"><span className="flex items-center gap-2 text-sm font-medium text-white">{action.title}<ArrowRight className="h-3.5 w-3.5 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-indigo-300" /></span><span className="mt-1 block text-xs leading-5 text-slate-500">{action.text}</span></span></Link>)}
      </motion.div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {[
          { label: "Businesses", value: data?.businesses.length ?? 0, icon: Building2, color: "text-indigo-400" },
          { label: "Reports", value: data?.recentReports.length ?? 0, icon: FileText, color: "text-violet-400" },
          { label: "Conversations", value: data?.recentConversations.length ?? 0, icon: Bot, color: "text-emerald-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Businesses */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Businesses</CardTitle>
              <Link href="/businesses/new">
                <Button size="sm" variant="outline">
                  <Plus className="h-3.5 w-3.5" /> New
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!data?.businesses.length ? (
                <div className="text-center py-8">
                  <Building2 className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No businesses yet</p>
                  <Link href="/businesses/new" className="mt-3 inline-block">
                    <Button size="sm">Create your first business</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.businesses.map((b) => (
                    <Link key={b.id} href={`/businesses/${b.id}/ai`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-semibold text-sm">
                          {b.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{b.name}</p>
                          <p className="text-xs text-slate-500">{b.industry || "No industry"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{STAGE_LABELS[b.stage]}</Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reports */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.recentReports.length ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No reports yet. Generate your first analysis.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentReports.map((r) => (
                    <Link key={r.id} href={`/reports/${r.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                      <div>
                        <p className="text-sm font-medium text-white">{r.title}</p>
                        <p className="text-xs text-slate-500">{r.business.name} · {formatRelativeTime(r.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.status === "COMPLETED" ? "success" : r.status === "FAILED" ? "danger" : "warning"}>
                          {REPORT_TYPE_LABELS[r.type]}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Conversations */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.recentConversations.length ? (
                <div className="text-center py-8">
                  <Bot className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No conversations yet. Start chatting with your AI consultant.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.recentConversations.map((c) => (
                    <Link key={c.id} href={`/businesses/${c.businessId}/ai?conversation=${c.id}`} className="p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5 group">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white line-clamp-1">{c.title}</p>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-0.5 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{c.business.name} · {formatRelativeTime(c.updatedAt)}</p>
                      {c.messages?.[0] && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{c.messages[0].content}</p>
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
