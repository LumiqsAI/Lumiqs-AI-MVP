import Link from "next/link";
import { ArrowRight, Check, Mail, ShieldCheck, Sparkles } from "lucide-react";

export function PublicHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Lumiqs AI home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white shadow-[0_0_30px_rgba(99,102,241,.35)]">L</span>
          <span className="font-semibold tracking-tight text-white">Lumiqs AI</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex" aria-label="Main navigation">
          <Link href="/#capabilities" className="transition-colors hover:text-white">Capabilities</Link>
          <Link href="/#method" className="transition-colors hover:text-white">How it works</Link>
          <Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link>
          <Link href="/help" className="transition-colors hover:text-white">Help</Link>
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400">Go to dashboard <ArrowRight className="h-3.5 w-3.5" /></Link> : <><Link href="/sign-in" className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block">Sign in</Link><Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400">Start free <ArrowRight className="h-3.5 w-3.5" /></Link></>}
        </div>
      </div>
    </header>
  );
}

const productLinks = [
  ["AI Consultant", "/sign-up"],
  ["Business Analysis", "/sign-up"],
  ["Market Research", "/sign-up"],
  ["Strategy & Execution", "/sign-up"],
];

const resourceLinks = [["Pricing", "/pricing"], ["Help center", "/help"], ["FAQ", "/faq"], ["Contact", "/contact"]];
const legalLinks = [["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"], ["Acceptable use", "/acceptable-use"], ["AI usage policy", "/ai-policy"], ["Disclaimer", "/disclaimer"], ["Security", "/security"], ["Code of conduct", "/code-of-conduct"]];

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">L</span><span className="font-semibold text-white">Lumiqs AI</span></Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">Business decision support for founders who want clearer thinking, stronger evidence, and a plan they can execute.</p>
          <a href="mailto:support@lumiqs.ai" className="mt-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><Mail className="h-4 w-4" /> support@lumiqs.ai</a>
        </div>
        <FooterColumn title="Product" links={productLinks} />
        <div className="grid grid-cols-2 gap-8 lg:col-span-2">
          <FooterColumn title="Resources" links={resourceLinks} />
          <FooterColumn title="Trust & legal" links={legalLinks} />
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-5 py-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span>© {new Date().getFullYear()} Lumiqs AI. All rights reserved.</span>
        <span>AI-generated guidance is informational and should be independently evaluated.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return <div><h2 className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">{title}</h2><ul className="mt-5 space-y-3">{links.map(([label, href]) => <li key={href + label}><Link href={href} className="text-sm text-slate-400 transition-colors hover:text-white">{label}</Link></li>)}</ul></div>;
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-950 text-white"><PublicHeader />{children}<PublicFooter /></div>;
}

export function TrustStrip() {
  return <div className="mx-auto grid max-w-7xl gap-3 px-5 pb-20 sm:grid-cols-3 lg:px-8"><TrustItem icon={<ShieldCheck className="h-4 w-4" />} title="Private by workspace" text="Business context stays scoped to your workspace." /><TrustItem icon={<Sparkles className="h-4 w-4" />} title="Evidence-aware" text="Assumptions and estimates are called out clearly." /><TrustItem icon={<Check className="h-4 w-4" />} title="Built for action" text="Every insight can become a next step." /></div>;
}

function TrustItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="border-l border-indigo-400/40 pl-4"><div className="flex items-center gap-2 text-sm font-medium text-indigo-200">{icon}{title}</div><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>;
}
