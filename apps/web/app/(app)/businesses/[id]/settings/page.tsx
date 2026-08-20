"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiClient } from "@/lib/api/client";

const STAGES = [
  { value: "IDEA", label: "Idea" }, { value: "PRE_LAUNCH", label: "Pre-Launch" },
  { value: "MVP", label: "MVP" }, { value: "EARLY_REVENUE", label: "Early Revenue" },
  { value: "GROWTH", label: "Growth" }, { value: "ESTABLISHED", label: "Established" },
];

type ProfileMeta = {
  source: "manual" | "public_website";
  site?: { title?: string; description?: string; socialProfiles?: Array<{ platform: string; url: string }>; seo?: { score?: number; checks?: Array<{ label: string; passed: boolean; detail: string }> } };
};

export default function BusinessSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileMeta, setProfileMeta] = useState<ProfileMeta>({ source: "manual" });
  const [form, setForm] = useState({ name: "", industry: "", stage: "IDEA", country: "", teamSize: "", revenueModel: "", targetAudience: "", description: "", goals: "", challenges: "", website: "" });
  const router = useRouter();
  const api = useApiClient();

  useEffect(() => {
    params.then(async ({ id }) => {
      setBusinessId(id);
      try {
        const b = await api.get<typeof form & { id: string; profileSource?: "manual" | "public_website"; publicProfile?: ProfileMeta["site"] }>(`/businesses/${id}`);
        setForm({ name: b.name || "", industry: b.industry || "", stage: (b as { stage?: string }).stage || "IDEA", country: (b as { country?: string }).country || "", teamSize: (b as { teamSize?: string }).teamSize || "", revenueModel: (b as { revenueModel?: string }).revenueModel || "", targetAudience: (b as { targetAudience?: string }).targetAudience || "", description: (b as { description?: string }).description || "", goals: (b as { goals?: string }).goals || "", challenges: (b as { challenges?: string }).challenges || "", website: (b as { website?: string }).website || "" });
        setProfileMeta({ source: b.profileSource || "manual", site: b.publicProfile });
      } catch { /* silent */ }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const missing = Object.entries(form).find(([key, value]) => key !== "stage" && !value.trim());
    if (missing) {
      toast.error(`Complete ${missing[0].replace(/([A-Z])/g, " $1").toLowerCase()} before saving`);
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/businesses/${businessId}`, form);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBusiness() {
    if (!confirm("Delete this business? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/businesses/${businessId}`);
      toast.success("Business deleted");
      router.push("/businesses");
    } catch {
      toast.error("Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl p-4 sm:p-6 lg:p-8 xl:mx-0 2xl:mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2"><Settings className="h-5 w-5" />Business Settings</h1>
        <p className="text-slate-400 mb-8">Update your business information to improve AI recommendations.</p>

        <Card className="mb-6">
          <CardHeader><CardTitle>Business profile source</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: "var(--muted-fg)" }}>{profileMeta.source === "public_website" ? "Confirmed from a public website scan" : "Entered manually"}</p>
            {profileMeta.source === "public_website" && profileMeta.site && <>
              <p className="mt-2 text-sm" style={{ color: "var(--page-fg)" }}>{profileMeta.site.title || "Public website"}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--muted-fg)" }}>SEO basics: {profileMeta.site.seo?.score ?? "—"}/100</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">{profileMeta.site.socialProfiles?.length ? profileMeta.site.socialProfiles.map((profile) => <a key={profile.url} href={profile.url} target="_blank" rel="noreferrer" className="underline" style={{ color: "var(--accent)" }}>{profile.platform}</a>) : <span style={{ color: "var(--muted-fg)" }}>No public social profiles were found.</span>}</div>
              <details className="mt-3 text-xs" style={{ color: "var(--muted-fg)" }}><summary className="cursor-pointer">View saved website scan</summary><ul className="mt-2 space-y-1">{profileMeta.site.seo?.checks?.map((check) => <li key={check.label}>{check.passed ? "✓" : "—"} {check.label}: {check.detail}</li>)}</ul></details>
            </>}
          </CardContent>
        </Card>

        <form onSubmit={save} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm text-slate-400 mb-1.5 block">Business Name *</label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-sm text-slate-400 mb-1.5 block">Industry</label><Input value={form.industry} onChange={(e) => set("industry", e.target.value)} /></div>
                <div><label className="text-sm text-slate-400 mb-1.5 block">Stage</label>
                  <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-sm text-slate-400 mb-1.5 block">Country</label><Input value={form.country} onChange={(e) => set("country", e.target.value)} /></div>
                <div><label className="text-sm text-slate-400 mb-1.5 block">Team Size</label><Input value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} /></div>
              </div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">Website</label><Input value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Business Context</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm text-slate-400 mb-1.5 block">Revenue Model</label><Input value={form.revenueModel} onChange={(e) => set("revenueModel", e.target.value)} /></div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">Target Audience</label><Input value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} /></div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">Description</label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">Goals</label><Textarea value={form.goals} onChange={(e) => set("goals", e.target.value)} rows={2} /></div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">Challenges</label><Textarea value={form.challenges} onChange={(e) => set("challenges", e.target.value)} rows={2} /></div>
            </CardContent>
          </Card>

          <Button type="submit" loading={loading} size="lg">Save Changes</Button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/8">
          <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
          <Button variant="destructive" onClick={deleteBusiness} loading={deleting}>
            <Trash2 className="h-4 w-4" /> Delete Business
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
