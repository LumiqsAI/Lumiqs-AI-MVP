import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Bot, BarChart3, Globe, Lightbulb, FileText, Rocket, Check, CircleDot, Search, ShieldCheck } from "lucide-react";
import { PublicFooter, PublicHeader, TrustStrip } from "@/components/shared/public-site";

export default async function HomePage() {
  const { userId } = await auth();
  const isAuthenticated = Boolean(userId);

  const features = [
    { icon: Bot, title: "Consult", desc: "Ask a hard business question and get a grounded point of view." },
    { icon: BarChart3, title: "Understand", desc: "Turn business context into strengths, risks, and opportunities." },
    { icon: Globe, title: "Research", desc: "Explore customers, markets, trends, and competitive alternatives." },
    { icon: Lightbulb, title: "Choose", desc: "Compare strategic paths with clear assumptions and trade-offs." },
    { icon: Rocket, title: "Execute", desc: "Translate a recommendation into a focused, measurable roadmap." },
    { icon: FileText, title: "Share", desc: "Create polished reports that keep the decision legible." },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicHeader isAuthenticated={isAuthenticated} />
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(79,70,229,.22),transparent_32%),linear-gradient(135deg,#020617_0%,#0b1025_52%,#111827_100%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 pb-20 pt-20 lg:grid-cols-[.95fr_1.05fr] lg:px-8 lg:pb-28 lg:pt-28">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 border border-indigo-300/20 bg-indigo-300/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[.18em] text-indigo-200"><CircleDot className="h-3.5 w-3.5" /> Decision intelligence for founders</div>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-.04em] text-white md:text-7xl">Make the next business decision with clarity.</h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">Lumiqs AI understands your business, tests the situation, surfaces the opportunity, and turns a recommendation into a plan your team can actually execute.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href={isAuthenticated ? "/dashboard" : "/sign-up"} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-400">{isAuthenticated ? "Go to dashboard" : "Start building smarter"} <ArrowRight className="h-4 w-4" /></Link>{!isAuthenticated && <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-3 font-medium text-slate-200 transition-colors hover:bg-white/5">Log in</Link>}<Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-3 font-medium text-slate-200 transition-colors hover:bg-white/5">See pricing</Link></div>
              <p className="mt-5 text-xs text-slate-500">{isAuthenticated ? "Your workspace is ready when you are." : "No credit card required. Bring one business question."}</p>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-indigo-500/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-2xl shadow-indigo-950/40">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-xs font-medium text-slate-300">Lumiqs workspace</span></div><span className="text-xs text-slate-600">Acme SaaS / Strategy</span></div>
                <div className="grid min-h-[390px] grid-cols-[145px_1fr]">
                  <div className="border-r border-white/10 bg-slate-950/50 p-3"><p className="px-2 pb-3 text-[10px] uppercase tracking-[.18em] text-slate-600">Business</p>{["Overview", "AI Consultant", "Analysis", "Strategy", "Execution"].map((item, i) => <div key={item} className={`mb-1 rounded-md px-2 py-2 text-xs ${i === 1 ? "bg-indigo-500/20 text-indigo-200" : "text-slate-500"}`}>{item}</div>)}</div>
                  <div className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[.18em] text-indigo-300">Decision brief</p><h2 className="mt-2 text-xl font-semibold text-white">Where should we focus next?</h2></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">Context loaded</span></div><div className="mt-6 rounded-xl border border-white/10 bg-white/[.03] p-4"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-xs text-indigo-200">L</span><div><p className="text-xs leading-5 text-slate-300">Your strongest near-term move is to narrow the ICP before adding another acquisition channel.</p><div className="mt-4 grid grid-cols-3 gap-2"><div className="border-l border-indigo-400/50 pl-2"><p className="text-[10px] text-slate-600">Priority</p><p className="mt-1 text-xs text-white">High</p></div><div className="border-l border-indigo-400/50 pl-2"><p className="text-[10px] text-slate-600">Signal</p><p className="mt-1 text-xs text-white">5 interviews</p></div><div className="border-l border-indigo-400/50 pl-2"><p className="text-[10px] text-slate-600">Horizon</p><p className="mt-1 text-xs text-white">2 weeks</p></div></div></div></div></div><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Search className="h-3.5 w-3.5" /> Business memory and recent decisions included</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <TrustStrip />
        <section id="capabilities" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-300">One workspace, a clearer point of view</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">The operating system for better business questions.</h2><p className="mt-5 text-base leading-7 text-slate-400">Lumiqs keeps your context, analysis, recommendations, and execution in one decision trail.</p></div><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{features.map((feature) => <div key={feature.title} className="group border border-white/10 bg-white/[.025] p-6 transition-colors hover:border-indigo-300/30 hover:bg-indigo-300/[.04]"><feature.icon className="h-5 w-5 text-indigo-300" /><h3 className="mt-8 text-lg font-medium text-white">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{feature.desc}</p><span className="mt-6 inline-flex items-center gap-2 text-xs text-slate-600 group-hover:text-indigo-300">Explore the workflow <ArrowRight className="h-3 w-3" /></span></div>)}</div></section>
        <section id="method" className="border-y border-white/10 bg-slate-900/50"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-300">The Lumiqs method</p><h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Context before confidence.</h2><p className="mt-5 text-sm leading-7 text-slate-400">Good recommendations begin with the right business context. Lumiqs remembers what matters and keeps uncertainty visible.</p></div><div className="grid gap-3">{[{n:"01",t:"Frame the situation",d:"Business profile, goals, challenges, and current question."},{n:"02",t:"Find the signal",d:"Relevant memory and decision principles, not an undifferentiated data dump."},{n:"03",t:"Make the choice",d:"A recommendation with trade-offs, risks, and what needs validation."},{n:"04",t:"Move this week",d:"Prioritized actions, success metrics, and a report you can share."}].map((step) => <div key={step.n} className="grid grid-cols-[42px_1fr] gap-4 border-b border-white/10 py-4"><span className="text-xs font-semibold text-indigo-300">{step.n}</span><div><h3 className="font-medium text-white">{step.t}</h3><p className="mt-1 text-sm text-slate-500">{step.d}</p></div></div>)}</div></div></section>
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-10 border border-indigo-300/20 bg-indigo-300/[.04] p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12"><div><ShieldCheck className="h-6 w-6 text-indigo-300" /><h2 className="mt-5 text-3xl font-semibold text-white">A sharper answer is only useful when you can trust the process.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">Lumiqs does not promise outcomes. It gives you a structured way to think, evidence to gather, and decisions to revisit.</p></div><Link href="/security" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-200 hover:text-white">Our security approach <ArrowRight className="h-4 w-4" /></Link></div></section>
        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8"><div className="flex flex-col items-start justify-between gap-8 border-t border-white/10 pt-16 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-300">Make the next move legible</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white md:text-5xl">Bring Lumiqs your hardest business question.</h2></div><Link href={isAuthenticated ? "/dashboard" : "/sign-up"} className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 font-medium text-white hover:bg-indigo-400">{isAuthenticated ? "Open dashboard" : "Start free"} <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <PublicFooter />
    </div>
  );
}
