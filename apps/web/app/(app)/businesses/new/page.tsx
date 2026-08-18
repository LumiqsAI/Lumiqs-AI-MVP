"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
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

export default function NewBusinessPage() {
  const router = useRouter();
  const api = useApiClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", industry: "", stage: "IDEA", country: "", teamSize: "",
    revenueModel: "", targetAudience: "", description: "", goals: "", challenges: "", website: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Business name is required"); return; }
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

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-white mb-2">Create Business</h1>
        <p className="text-slate-400 mb-8">Set up your business workspace. The more context you provide, the better your AI consultant will be.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Business Name *</label>
                <Input placeholder="e.g. Lumiqs AI" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Industry</label>
                  <Input placeholder="e.g. SaaS, E-commerce" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Stage</label>
                  <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Country</label>
                  <Input placeholder="e.g. United States" value={form.country} onChange={(e) => set("country", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Team Size</label>
                  <Input placeholder="e.g. 1-5, 10-50" value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Website</label>
                <Input placeholder="https://..." value={form.website} onChange={(e) => set("website", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Business Context</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Revenue Model</label>
                <Input placeholder="e.g. SaaS subscription, Marketplace, Consulting" value={form.revenueModel} onChange={(e) => set("revenueModel", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Target Audience</label>
                <Input placeholder="e.g. Startup founders, SME owners" value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Description</label>
                <Textarea placeholder="What does your business do? What problem does it solve?" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Goals</label>
                <Textarea placeholder="What are your main business goals?" value={form.goals} onChange={(e) => set("goals", e.target.value)} rows={2} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Challenges</label>
                <Textarea placeholder="What are your biggest challenges right now?" value={form.challenges} onChange={(e) => set("challenges", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" loading={loading} size="lg">Create Business</Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
