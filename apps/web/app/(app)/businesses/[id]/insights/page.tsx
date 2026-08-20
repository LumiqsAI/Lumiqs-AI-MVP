"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Bookmark, Trash2, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Spinner, EmptyState } from "@/components/ui/loading";
import { useApiClient } from "@/lib/api/client";
import { Insight } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export default function InsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const [businessId, setBusinessId] = useState("");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", source: "" });
  const api = useApiClient();

  useEffect(() => {
    params.then(async ({ id }) => {
      setBusinessId(id);
      try {
        const data = await api.get<Insight[]>(`/businesses/${id}/insights`);
        setInsights(data);
      } catch {
        toast.error("Failed to load insights");
      } finally {
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveInsight(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const insight = await api.post<Insight>(`/businesses/${businessId}/insights`, form);
      setInsights((prev) => [insight, ...prev]);
      setForm({ title: "", content: "", source: "" });
      setAdding(false);
      toast.success("Insight saved");
    } catch {
      toast.error("Failed to save insight");
    } finally {
      setSaving(false);
    }
  }

  async function deleteInsight(id: string) {
    try {
      await api.delete(`/insights/${id}`);
      setInsights((prev) => prev.filter((i) => i.id !== id));
      toast.success("Insight deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:mx-0 2xl:mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Saved Insights</h1>
          <p className="text-slate-400 mt-1">Key learnings and recommendations saved from AI conversations.</p>
        </div>
        <Button onClick={() => setAdding(!adding)}>
          <Plus className="h-4 w-4" /> Add Insight
        </Button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card>
              <CardHeader><CardTitle>New Insight</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={saveInsight} className="space-y-3">
                  <Input
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                  <Textarea
                    placeholder="Insight content..."
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    rows={4}
                    required
                  />
                  <Input
                    placeholder="Source (optional, e.g. AI Consultant)"
                    value={form.source}
                    onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" loading={saving}>Save Insight</Button>
                    <Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!loading && !insights.length && (
        <EmptyState
          icon={<Bookmark className="h-12 w-12" />}
          title="No insights yet"
          description="Save important AI recommendations and learnings here for future reference."
          action={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add your first insight</Button>}
        />
      )}

      {!loading && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="hover:border-white/15 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Bookmark className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <h3 className="font-medium text-white">{insight.title}</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{insight.content}</p>
                      <div className="flex items-center gap-3 mt-3">
                        {insight.source && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Tag className="h-3 w-3" />{insight.source}
                          </span>
                        )}
                        <span className="text-xs text-slate-600">{formatRelativeTime(insight.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteInsight(insight.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
