"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Zap } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/lib/api/client";

interface PlanInfo {
  plan: "explorer" | "founder" | "studio" | "custom";
  limits: {
    maxBusinesses: number;
    maxAiMessagesPerMonth: number;
    maxInsightsPerBusiness: number;
    maxReportsPerMonth: number;
    canExportPdf: boolean;
    canAccessMarketResearch: boolean;
    canAccessStrategy: boolean;
    canAccessExecution: boolean;
  };
}

const PLAN_LABELS = { explorer: "Explorer", founder: "Founder", studio: "Studio", custom: "Custom" };
const PLAN_COLORS: Record<string, string> = {
  explorer: "default",
  founder: "success",
  studio: "info",
  custom: "info",
};

function fmt(val: number) {
  return val === -1 ? "Unlimited" : String(val);
}

export default function SettingsPage() {
  const { user } = useUser();
  const api = useApiClient();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    setPlanError(null);
    try {
      setPlanInfo(await api.get<PlanInfo>("/users/plan"));
    } catch {
      setPlanError("We couldn't load your plan details. Please try again.");
    }
  }, [api]);

  useEffect(() => { void loadPlan(); }, [loadPlan]);

  const limits = planInfo?.limits;
  const plan = planInfo?.plan ?? "explorer";
  const isUpgradeable = plan === "explorer" || plan === "founder";

  const limitRows = limits
    ? [
        { label: "Businesses", value: fmt(limits.maxBusinesses) },
        { label: "AI messages / month", value: fmt(limits.maxAiMessagesPerMonth) },
        { label: "Insights per business", value: fmt(limits.maxInsightsPerBusiness) },
        { label: "Reports / month", value: fmt(limits.maxReportsPerMonth) },
        { label: "PDF export", value: limits.canExportPdf ? "Yes" : "No" },
        { label: "Market research", value: limits.canAccessMarketResearch ? "Yes" : "No" },
        { label: "Strategy & execution", value: limits.canAccessStrategy ? "Yes" : "No" },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>

        {/* Account */}
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              {user?.imageUrl && <img src={user.imageUrl} alt="Avatar" className="w-12 h-12 rounded-full" />}
              <div>
                <p className="font-medium text-white">{user?.fullName || "—"}</p>
                <p className="text-sm text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Manage your account settings through Clerk.</p>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current plan</CardTitle>
            {planInfo && (
              <Badge variant={PLAN_COLORS[plan] as "default" | "success" | "info"}>
                {PLAN_LABELS[plan]}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {planError ? (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-rose-400">{planError}</p>
                <Button size="sm" variant="outline" onClick={() => void loadPlan()}>Try again</Button>
              </div>
            ) : !planInfo ? (
              <p className="text-sm text-slate-500">Loading plan info…</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {limitRows.map(({ label, value }) => (
                    <li key={label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        {value === "Yes" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                        {value === "No"
                          ? <span className="text-slate-600">—</span>
                          : value}
                      </span>
                    </li>
                  ))}
                </ul>

                {isUpgradeable && (
                  <div
                    className="mt-4 flex items-center justify-between rounded-xl p-4"
                    style={{ background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-400" />
                      <p className="text-sm text-indigo-200">
                        {plan === "explorer" ? "Upgrade to unlock all features" : "Upgrade to Studio for unlimited access"}
                      </p>
                    </div>
                    <Link href="/pricing">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        Upgrade <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
