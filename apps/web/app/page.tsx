import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Bot, BarChart3, Globe, Lightbulb, FileText, Rocket } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const features = [
    { icon: Bot, title: "AI Consultant", desc: "Ask any business question and get expert, context-aware answers." },
    { icon: BarChart3, title: "Business Analysis", desc: "SWOT analysis, strengths, risks, and actionable recommendations." },
    { icon: Globe, title: "Market Research", desc: "Industry overview, customer personas, trends, and opportunities." },
    { icon: Lightbulb, title: "Strategy", desc: "Revenue, pricing, marketing, sales, and growth strategies." },
    { icon: Rocket, title: "Execution Plan", desc: "Week-by-week roadmap with tasks, priorities, and success metrics." },
    { icon: FileText, title: "PDF Reports", desc: "Professional branded reports you can share with your team." },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-white">Lumiqs AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
          <Link href="/sign-up" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Business Intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          From business question<br />to intelligent decision
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Lumiqs AI is your AI business consultant. Get expert analysis, strategy, market research, and execution plans — all tailored to your specific business.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/sign-in" className="inline-flex items-center gap-2 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 px-6 py-3 rounded-lg font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-white/8 bg-white/3 p-6 hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
