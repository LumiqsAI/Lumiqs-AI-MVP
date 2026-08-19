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
    <div className="min-h-screen" style={{ background: "var(--page-bg)", color: "var(--page-fg)" }}>
      <PublicHeader isAuthenticated={isAuthenticated} />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ borderBottom: "1px solid var(--line)" }}>
          <div
            className="absolute inset-0"
            style={{ background: "var(--hero-gradient)" }}
          />
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(80px)" }} />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 pb-20 pt-20 lg:grid-cols-[.95fr_1.05fr] lg:px-8 lg:pb-28 lg:pt-28">
            <div>
              <div
                className="mb-7 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-[.18em] rounded-full"
                style={{
                  border: "1px solid rgba(99,102,241,.3)",
                  background: "rgba(99,102,241,.1)",
                  color: "#a5b4fc",
                }}
              >
                <CircleDot className="h-3.5 w-3.5" /> Decision intelligence for founders
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-.04em] md:text-7xl" style={{ color: "var(--page-fg)" }}>
                Make the next business decision{" "}
                <span className="gradient-text">with clarity.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8" style={{ color: "var(--muted-fg)" }}>
                Lumiqs AI understands your business, tests the situation, surfaces the opportunity, and turns a recommendation into a plan your team can actually execute.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={isAuthenticated ? "/dashboard" : "/sign-up"}
                  className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
                >
                  {isAuthenticated ? "Go to dashboard" : "Start building smarter"} <ArrowRight className="h-4 w-4" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors"
                    style={{
                      border: "1px solid var(--line-strong)",
                      color: "var(--muted-fg)",
                      background: "var(--surface-raised)",
                    }}
                  >
                    Log in
                  </Link>
                )}
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors"
                  style={{
                    border: "1px solid var(--line-strong)",
                    color: "var(--muted-fg)",
                    background: "var(--surface-raised)",
                  }}
                >
                  See pricing
                </Link>
              </div>
              <p className="mt-5 text-xs" style={{ color: "var(--muted-fg)" }}>
                {isAuthenticated ? "Your workspace is ready when you are." : "No credit card required. Bring one business question."}
              </p>
            </div>

            {/* Hero card */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] blur-3xl" style={{ background: "var(--accent-glow)" }} />
              <div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  border: "1px solid var(--card-border)",
                  background: "var(--card-bg)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: "1px solid var(--line)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium" style={{ color: "var(--muted-fg)" }}>Lumiqs workspace</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-fg)", opacity: 0.6 }}>Acme SaaS / Strategy</span>
                </div>

                <div className="grid min-h-[390px] grid-cols-[145px_1fr]">
                  <div className="p-3" style={{ borderRight: "1px solid var(--line)", background: "var(--surface)" }}>
                    <p className="px-2 pb-3 text-[10px] uppercase tracking-[.18em]" style={{ color: "var(--muted-fg)", opacity: 0.6 }}>Business</p>
                    {["Overview", "AI Consultant", "Analysis", "Strategy", "Execution"].map((item, i) => (
                      <div
                        key={item}
                        className="mb-1 rounded-md px-2 py-2 text-xs"
                        style={i === 1
                          ? { background: "rgba(99,102,241,.2)", color: "#a5b4fc" }
                          : { color: "var(--muted-fg)" }
                        }
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[.18em] text-indigo-400">Decision brief</p>
                        <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--page-fg)" }}>Where should we focus next?</h2>
                      </div>
                      <span className="rounded-full px-2 py-1 text-[10px] text-emerald-400" style={{ border: "1px solid rgba(52,211,153,.2)", background: "rgba(52,211,153,.1)" }}>
                        Context loaded
                      </span>
                    </div>

                    <div className="mt-6 rounded-xl p-4" style={{ border: "1px solid var(--line)", background: "var(--surface-raised)" }}>
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs text-indigo-300" style={{ background: "rgba(99,102,241,.2)" }}>L</span>
                        <div>
                          <p className="text-xs leading-5" style={{ color: "var(--muted-fg)" }}>
                            Your strongest near-term move is to narrow the ICP before adding another acquisition channel.
                          </p>
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {[["Priority", "High"], ["Signal", "5 interviews"], ["Horizon", "2 weeks"]].map(([k, v]) => (
                              <div key={k} className="pl-2" style={{ borderLeft: "2px solid rgba(99,102,241,.5)" }}>
                                <p className="text-[10px]" style={{ color: "var(--muted-fg)", opacity: 0.6 }}>{k}</p>
                                <p className="mt-1 text-xs font-medium" style={{ color: "var(--page-fg)" }}>{v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "var(--muted-fg)", opacity: 0.7 }}>
                      <Search className="h-3.5 w-3.5" /> Business memory and recent decisions included
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TrustStrip />

        {/* Capabilities */}
        <section id="capabilities" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-400">One workspace, a clearer point of view</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl" style={{ color: "var(--page-fg)" }}>
              The operating system for better business questions.
            </h2>
            <p className="mt-5 text-base leading-7" style={{ color: "var(--muted-fg)" }}>
              Lumiqs keeps your context, analysis, recommendations, and execution in one decision trail.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group glass-card rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-indigo-400/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(99,102,241,.15)" }}>
                  <feature.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-6 text-lg font-medium" style={{ color: "var(--page-fg)" }}>{feature.title}</h3>
                <p className="mt-3 text-sm leading-6" style={{ color: "var(--muted-fg)" }}>{feature.desc}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Explore the workflow <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Method */}
        <section id="method" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-400">The Lumiqs method</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: "var(--page-fg)" }}>
                Context before confidence.
              </h2>
              <p className="mt-5 text-sm leading-7" style={{ color: "var(--muted-fg)" }}>
                Good recommendations begin with the right business context. Lumiqs remembers what matters and keeps uncertainty visible.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                { n: "01", t: "Frame the situation", d: "Business profile, goals, challenges, and current question." },
                { n: "02", t: "Find the signal", d: "Relevant memory and decision principles, not an undifferentiated data dump." },
                { n: "03", t: "Make the choice", d: "A recommendation with trade-offs, risks, and what needs validation." },
                { n: "04", t: "Move this week", d: "Prioritized actions, success metrics, and a report you can share." },
              ].map((step) => (
                <div key={step.n} className="grid grid-cols-[42px_1fr] gap-4 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
                  <span className="text-xs font-bold text-indigo-400">{step.n}</span>
                  <div>
                    <h3 className="font-medium" style={{ color: "var(--page-fg)" }}>{step.t}</h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--muted-fg)" }}>{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust CTA */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div
            className="glass-card rounded-2xl p-8 md:grid md:grid-cols-[1fr_auto] md:items-center md:p-12"
            style={{ borderColor: "rgba(99,102,241,.25)", background: "rgba(99,102,241,.05)" }}
          >
            <div>
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
              <h2 className="mt-5 text-3xl font-semibold" style={{ color: "var(--page-fg)" }}>
                A sharper answer is only useful when you can trust the process.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: "var(--muted-fg)" }}>
                Lumiqs does not promise outcomes. It gives you a structured way to think, evidence to gather, and decisions to revisit.
              </p>
            </div>
            <Link href="/security" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 md:mt-0">
              Our security approach <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 pt-16 md:flex-row md:items-end" style={{ borderTop: "1px solid var(--line)" }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-400">Make the next move legible</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight md:text-5xl" style={{ color: "var(--page-fg)" }}>
                Bring Lumiqs your hardest business question.
              </h2>
            </div>
            <Link
              href={isAuthenticated ? "/dashboard" : "/sign-up"}
              className="btn-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              {isAuthenticated ? "Open dashboard" : "Start free"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
