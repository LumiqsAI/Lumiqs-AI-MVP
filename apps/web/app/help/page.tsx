import Link from "next/link";
import { ArrowRight, BookOpen, LifeBuoy, ShieldCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { PublicShell } from "@/components/shared/public-site";

export const metadata = { title: "Help Center | Lumiqs AI" };

const categories = [
  { icon: BookOpen, title: "Getting started", text: "Create a workspace, add context, and ask your first decision question." },
  { icon: ShieldCheck, title: "Privacy and security", text: "Understand business isolation, authentication, AI processing, and deletion." },
  { icon: LifeBuoy, title: "Troubleshooting", text: "Find help for connection issues, generated reports, and account access." },
];

export default async function HelpPage() {
  const { userId } = await auth();
  const isAuthenticated = Boolean(userId);

  return (
    <PublicShell isAuthenticated={isAuthenticated}>
      <main className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-400">Lumiqs support</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight" style={{ color: "var(--page-fg)" }}>
          A clearer answer is usually one good question away.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8" style={{ color: "var(--muted-fg)" }}>
          Browse the basics or send us the problem you are trying to solve.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className="rounded-xl p-6"
              style={{ border: "1px solid var(--line)", background: "var(--card-bg)" }}
            >
              <category.icon className="h-5 w-5 text-indigo-400" />
              <h2 className="mt-8 text-lg font-medium" style={{ color: "var(--page-fg)" }}>{category.title}</h2>
              <p className="mt-3 text-sm leading-6" style={{ color: "var(--muted-fg)" }}>{category.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10" style={{ borderTop: "1px solid var(--line)" }}>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--page-fg)" }}>Common questions</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              "What is Lumiqs AI?",
              "How does Lumiqs understand my business?",
              "Can I create multiple businesses?",
              "Can I export reports?",
              "Is AI information always accurate?",
              "How do I delete my data?",
            ].map((question) => (
              <Link
                key={question}
                href="/faq"
                className="flex items-center justify-between p-4 text-sm transition-colors"
                style={{ border: "1px solid var(--line)", color: "var(--muted-fg)" }}
                onMouseEnter={undefined}
              >
                {question}
                <ArrowRight className="h-4 w-4 text-indigo-400" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
