"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicHeaderClient({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--line)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Lumiqs AI home">
          <img src="/logo.png" alt="Lumiqs AI" className="h-9 w-9 rounded-xl object-contain" />
          <span className="font-semibold tracking-tight" style={{ color: "var(--page-fg)" }}>
            Lumiqs AI
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Main navigation">
          {[["/#capabilities", "Capabilities"], ["/#method", "How it works"], ["/pricing", "Pricing"], ["/help", "Help"]].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-indigo-400"
              style={{ color: "var(--muted-fg)" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn-glow inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden text-sm transition-colors hover:text-indigo-400 sm:block"
                style={{ color: "var(--muted-fg)" }}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="btn-glow inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
              >
                Start free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
