"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiClient } from "@/lib/api/client";
import { Business } from "@/types";

const STAGES = [
  { value: "IDEA", label: "Idea" },
  { value: "PRE_LAUNCH", label: "Pre-Launch" },
  { value: "MVP", label: "MVP" },
  { value: "EARLY_REVENUE", label: "Early Revenue" },
  { value: "GROWTH", label: "Growth" },
  { value: "ESTABLISHED", label: "Established" },
];

type FormState = {
  name: string; industry: string; stage: string; country: string; teamSize: string;
  revenueModel: string; targetAudience: string; description: string; goals: string;
  challenges: string; website: string;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2.5" style={{ borderBottom: "1px solid var(--line)" }}>
      <span className="w-36 shrink-0 text-xs" style={{ color: "var(--subtle-fg)" }}>{label}</span>
      <span className="text-sm" style={{ color: "var(--page-fg)" }}>{value}</span>
    </div>
  );
}

export default function NewBusinessPage() {
  const router = useRouter();
  const api = useApiClient();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "", industry: "", stage: "IDEA", country: "", teamSize: "",
    revenueModel: "", targetAudience: "", description: "", goals: "", challenges: "", website: "",
  });

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Business name is required"); return; }
    setStep("confirm");
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const business = await api.post<Business>("/businesses", form);
      toast.success("Business created!");
      router.push(`/businesses/${business.id}/ai`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setLoading(false);
    }
  }

  const stageLabel = STAGES.find((s) => s.value === form.stage)?.label ?? form.stage;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--page-fg)" }}>Create Business</h1>
            <p className="mb-8 text-sm" style={{ color: "var(--muted-fg)" }}>
              Set up your business workspace. The more context you provide, the better your AI consultant will be.
            </p>

            <form onSubmit={handleReview} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Business Name *</label>
                    <Input placeholder="e.g. Lumiqs AI" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Industry</label>
                      <Input placeholder="e.g. SaaS, E-commerce" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Stage</label>
                      <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Target Region / Country</label>
                      <Input placeholder="e.g. United States" value={form.country} onChange={(e) => set("country", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Team Size</label>
                      <Input placeholder="e.g. 1-5, 10-50" value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Website</label>
                    <Input placeholder="https://..." value={form.website} onChange={(e) => set("website", e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Business Context</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Business Idea / Description</label>
                    <Textarea placeholder="What does your business do? What problem does it solve?" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
                  </div>
                  <div>
                    <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Business Model</label>
                    <Input placeholder="e.g. SaaS subscription, Marketplace, Consulting" value={form.revenueModel} onChange={(e) => set("revenueModel", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Target Customers</label>
                    <Input placeholder="e.g. Startup founders, SME owners" value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Main Goal</label>
                    <Textarea placeholder="What is the primary outcome you want from Lumiqs? e.g. Validate market demand, find GTM strategy" value={form.goals} onChange={(e) => set("goals", e.target.value)} rows={2} />
                  </div>
                  <div>
                    <label className="text-sm mb-1.5 block" style={{ color: "var(--muted-fg)" }}>Biggest Challenges</label>
                    <Textarea placeholder="What are your biggest challenges right now?" value={form.challenges} onChange={(e) => set("challenges", e.target.value)} rows={2} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" size="lg">
                  Review summary <ArrowRight className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <button
              onClick={() => setStep("form")}
              className="mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: "var(--muted-fg)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to edit
            </button>

            <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--page-fg)" }}>
              Here's what Lumiqs understood
            </h1>
            <p className="mb-8 text-sm" style={{ color: "var(--muted-fg)" }}>
              Review the context below. If anything looks off, go back and edit before starting your analysis.
            </p>

            <Card className="mb-6">
              <CardContent className="pt-5 pb-2">
                <SummaryRow label="Business" value={form.name} />
                <SummaryRow label="Industry" value={form.industry} />
                <SummaryRow label="Stage" value={stageLabel} />
                <SummaryRow label="Target region" value={form.country} />
                <SummaryRow label="Team size" value={form.teamSize} />
                <SummaryRow label="Business model" value={form.revenueModel} />
                <SummaryRow label="Target customers" value={form.targetAudience} />
                <SummaryRow label="Description" value={form.description} />
                <SummaryRow label="Main goal" value={form.goals} />
                <SummaryRow label="Challenges" value={form.challenges} />
                {form.website && <SummaryRow label="Website" value={form.website} />}
              </CardContent>
            </Card>

            <div
              className="mb-8 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)", color: "var(--muted-fg)" }}
            >
              Lumiqs will use this context for all analysis, market research, strategy, and execution planning in this workspace.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" loading={loading} onClick={handleCreate}>
                Looks good — create workspace <ArrowRight className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => setStep("form")}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
