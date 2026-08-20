import { FileText, LockKeyhole } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/shared/public-site";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SharedReport = {
  title: string;
  summary?: string;
  content?: Record<string, unknown>;
  createdAt: string;
};

function readable(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(readable).filter(Boolean).join("\n");
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return readable(item.recommendation ?? item.name ?? item.title ?? item.explanation ?? item.reason) ?? null;
  }
  return null;
}

function labelFor(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const response = await fetch(`${BASE}/api/v1/reports/shared/${token}`, { cache: "no-store" });
  const payload = await response.json().catch(() => null) as { success?: boolean; data?: SharedReport } | null;
  const report = payload?.success ? payload.data : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--page-bg)", color: "var(--page-fg)" }}>
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        {!report ? (
          <div className="rounded-2xl p-10 text-center" style={{ border: "1px solid var(--line)", background: "var(--surface-raised)" }}>
            <LockKeyhole className="mx-auto h-9 w-9 text-slate-400" />
            <h1 className="mt-4 text-xl font-semibold">This report is unavailable</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-fg)" }}>The link may be invalid or its owner may have revoked access.</p>
          </div>
        ) : (
          <article>
            <div className="mb-8 border-b pb-8" style={{ borderColor: "var(--line)" }}>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-400">Shared Lumiqs report</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">{report.title}</h1>
              <p className="mt-2 text-sm" style={{ color: "var(--muted-fg)" }}>{new Date(report.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
              {report.summary && <p className="mt-5 text-base leading-7" style={{ color: "var(--muted-fg)" }}>{report.summary}</p>}
            </div>
            {!report.content ? <p style={{ color: "var(--muted-fg)" }}>Report content is unavailable.</p> : (
              <div className="space-y-5">
                {Object.entries(report.content).map(([key, value]) => {
                  const text = readable(value);
                  return text ? (
                    <section key={key} className="rounded-xl p-5" style={{ border: "1px solid var(--line)", background: "var(--surface-raised)" }}>
                      <h2 className="text-base font-semibold">{labelFor(key)}</h2>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6" style={{ color: "var(--muted-fg)" }}>{text}</p>
                    </section>
                  ) : null;
                })}
              </div>
            )}
          </article>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
