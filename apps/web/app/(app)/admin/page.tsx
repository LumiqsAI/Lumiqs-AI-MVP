"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Building2, FileText, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiClient } from "@/lib/api/client";

type UserPlan = "explorer" | "founder" | "studio" | "custom";
type UserRole = "user" | "admin";

interface AdminUser {
  _id: string;
  name?: string;
  email: string;
  plan: UserPlan;
  role: UserRole;
  createdAt?: string;
}

interface UserListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface PlatformStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalBusinesses: number;
  totalReports: number;
  reportsThisMonth: number;
  planBreakdown: Record<string, number>;
}

const PLAN_LABELS: Record<UserPlan, string> = {
  explorer: "Explorer",
  founder: "Founder",
  studio: "Studio",
  custom: "Custom",
};

function planBadge(plan: UserPlan) {
  return plan === "custom" || plan === "studio" ? "info" : plan === "founder" ? "success" : "default";
}

export default function AdminPage() {
  const api = useApiClient();
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    api.get<{ role: string }>("/users/me").then((user) => {
      if (user.role === "admin") setAuthorized(true);
      else router.replace("/dashboard");
    }).catch(() => router.replace("/dashboard"));
  }, [api, router]);

  const load = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams({ page: "1", limit: "50" });
      if (query.trim()) queryString.set("search", query.trim());
      const [nextStats, userList] = await Promise.all([
        api.get<PlatformStats>("/admin/stats"),
        api.get<UserListResponse>(`/admin/users?${queryString.toString()}`),
      ]);
      setStats(nextStats);
      setUsers(userList.items);
      setTotal(userList.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load the admin dashboard");
      setStats(null);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (authorized) void load();
  }, [load, authorized]);

  if (!authorized) return null;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void load(search);
  };

  const updateUser = async (user: AdminUser, field: "plan" | "role", value: UserPlan | UserRole) => {
    setSavingId(user._id);
    try {
      const endpoint = field === "plan" ? `/admin/users/${user._id}/plan` : `/admin/users/${user._id}/role`;
      await api.patch(endpoint, { [field]: value });
      setUsers((current) => current.map((item) => item._id === user._id ? { ...item, [field]: value } : item));
      toast.success(`${user.email} updated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user");
    } finally {
      setSavingId(null);
    }
  };

  const statCards = [
    { label: "Users", value: stats?.totalUsers ?? 0, detail: `${stats?.newUsersThisMonth ?? 0} new this month`, icon: Users, color: "text-indigo-300" },
    { label: "Businesses", value: stats?.totalBusinesses ?? 0, detail: "Active workspaces", icon: Building2, color: "text-emerald-300" },
    { label: "Reports", value: stats?.totalReports ?? 0, detail: `${stats?.reportsThisMonth ?? 0} created this month`, icon: FileText, color: "text-violet-300" },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Restricted workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Admin dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Monitor usage and manage user plans and access.</p>
        </div>
        <Button variant="outline" onClick={() => void load(search)} loading={loading}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, detail, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5"><Icon className={`h-5 w-5 ${color}`} /></div>
              <div><p className="text-2xl font-semibold text-white">{value}</p><p className="text-xs text-slate-400">{label} · {detail}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>User management</CardTitle><p className="mt-1 text-sm text-slate-400">{total} user{total === 1 ? "" : "s"} in the platform</p></div>
          <form onSubmit={handleSearch} className="flex w-full gap-2 sm:w-80">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" aria-label="Search users" />
            <Button type="submit" size="icon" variant="outline" aria-label="Search users"><Search className="h-4 w-4" /></Button>
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3 font-medium">User</th><th className="px-3 py-3 font-medium">Plan</th><th className="px-3 py-3 font-medium">Role</th><th className="px-3 py-3 font-medium">Joined</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-400">Loading users…</td></tr> : users.length === 0 ? <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-400">No users found.</td></tr> : users.map((user) => (
                <tr key={user._id} className="border-b border-white/5 last:border-0"><td className="px-3 py-4"><p className="font-medium text-white">{user.name || "Unnamed user"}</p><p className="mt-0.5 text-xs text-slate-500">{user.email}</p></td><td className="px-3 py-4"><div className="flex items-center gap-2"><Badge variant={planBadge(user.plan)}>{PLAN_LABELS[user.plan]}</Badge><Select value={user.plan} disabled={savingId === user._id} onValueChange={(value) => void updateUser(user, "plan", value as UserPlan)}><SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(PLAN_LABELS) as UserPlan[]).map((plan) => <SelectItem key={plan} value={plan}>{PLAN_LABELS[plan]}</SelectItem>)}</SelectContent></Select></div></td><td className="px-3 py-4"><Select value={user.role} disabled={savingId === user._id} onValueChange={(value) => void updateUser(user, "role", value as UserRole)}><SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></td><td className="px-3 py-4 text-xs text-slate-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-6"><CardHeader><CardTitle>Plan distribution</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{(Object.keys(PLAN_LABELS) as UserPlan[]).map((plan) => <Badge key={plan} variant={planBadge(plan)}>{PLAN_LABELS[plan]}: {stats?.planBreakdown?.[plan] ?? 0}</Badge>)}</CardContent></Card>
    </div>
  );
}
