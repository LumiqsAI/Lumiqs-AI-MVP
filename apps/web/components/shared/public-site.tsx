import Link from "next/link";
import { ArrowRight, Check, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { PublicHeaderClient } from "./public-header-client";

export function PublicHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return <PublicHeaderClient isAuthenticated={isAuthenticated} />;
}

const productLinks = [
  ["AI Consultant",       "/sign-up"],
  ["Business Analysis",   "/sign-up"],
  ["Market Research",     "/sign-up"],
  ["Strategy & Execution","/sign-up"],
];

const resourceLinks = [["Pricing", "/pricing"], ["Help center", "/help"], ["FAQ", "/faq"], ["Contact", "/contact"]];
const legalLinks = [
  ["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"],
  ["Acceptable use", "/acceptable-use"], ["AI usage policy", "/ai-policy"],
  ["Disclaimer", "/disclaimer"], ["Security", "/security"], ["Code of conduct", "/code-of-conduct"],
];

export function PublicFooter() {
  return (
    <footer style={{ background: "var(--page-bg2)", borderTop: "1px solid var(--line)" }}>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Lumiqs AI" className="h-8 w-8 rounded-xl object-contain" />
            <span className="font-semibold text-sm" style={{ color: "var(--page-fg)" }}>Lumiqs AI</span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6" style={{ color: "var(--muted-fg)" }}>
            Business decision support for founders who want clearer thinking, stronger evidence, and a plan they can execute.
          </p>
          <a
            href="mailto:support@lumiqs.ai"
            className="mt-5 inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--muted-fg)" }}
          >
            <Mail className="h-4 w-4" /> support@lumiqs.ai
          </a>
        </div>
        <FooterColumn title="Product" links={productLinks} />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2">
          <FooterColumn title="Resources" links={resourceLinks} />
          <FooterColumn title="Trust & legal" links={legalLinks} />
        </div>
      </div>
      <div
        className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs sm:flex-row sm:items-center sm:justify-between lg:px-8"
        style={{ borderTop: "1px solid var(--line)", color: "var(--subtle-fg)" }}
      >
        <span>© {new Date().getFullYear()} Lumiqs AI. All rights reserved.</span>
        <span>AI-generated guidance is informational and should be independently evaluated.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h2
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--subtle-fg)" }}
      >
        {title}
      </h2>
      <ul className="mt-5 space-y-3">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <Link
              href={href}
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--muted-fg)" }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--page-bg)", color: "var(--page-fg)" }}>
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}

export function TrustStrip() {
  return (
    <div
      className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
      style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <TrustItem
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Private by workspace"
          text="Business context stays scoped to your workspace."
        />
        <TrustItem
          icon={<Sparkles className="h-4 w-4" />}
          title="Evidence-aware"
          text="Assumptions and estimates are called out clearly."
        />
        <TrustItem
          icon={<Check className="h-4 w-4" />}
          title="Built for action"
          text="Every insight can become a next step."
        />
      </div>
    </div>
  );
}

function TrustItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{
        border: "1px solid var(--line)",
        background: "var(--card-bg)",
        borderLeft: "2px solid var(--accent)",
      }}
    >
      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--accent)" }}>
        {icon}{title}
      </div>
      <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted-fg)" }}>{text}</p>
    </div>
  );
}
