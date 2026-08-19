"use client";

import Link from "next/link";
import { ArrowRight, Check, IndianRupee, DollarSign, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { PublicShell } from "@/components/shared/public-site";
import { useApiClient } from "@/lib/api/client";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const plans = [
  {
    name: "Explorer",
    planKey: "explorer" as const,
    usd: { price: "$0", period: "forever" },
    inr: { price: "₹0", period: "forever" },
    description: "Build your first business context and explore the Lumiqs method.",
    features: [
      "1 business workspace",
      "Business profile and memory",
      "AI Consultant access",
      "Limited monthly AI usage",
    ],
    cta: "Start free",
    href: "/sign-up",
    featured: false,
    badge: null,
    paid: false,
  },
  {
    name: "Founder",
    planKey: "founder" as const,
    usd: { price: "$19", period: "per month" },
    inr: { price: "₹199", period: "per month" },
    description: "For founders making decisions every week and turning insight into motion.",
    features: [
      "Up to 3 workspaces",
      "Unlimited saved insights",
      "Analysis and market research",
      "Strategy and execution plans",
      "Professional reports",
    ],
    cta: "Choose Founder",
    href: "/sign-up",
    featured: false,
    badge: null,
    paid: true,
  },
  {
    name: "Studio",
    planKey: "studio" as const,
    usd: { price: "$39", period: "per month" },
    inr: { price: "₹399", period: "per month" },
    description: "For consultants and small teams managing multiple decision trails.",
    features: [
      "Unlimited workspaces",
      "Higher AI usage limits",
      "Combined reports and PDF export",
      "Priority support",
      "Advanced workspace controls",
    ],
    cta: "Choose Studio",
    href: "/sign-up",
    featured: true,
    badge: "Most popular",
    paid: true,
  },
  {
    name: "Custom",
    planKey: "custom" as const,
    usd: { price: "Custom", period: "tailored for you" },
    inr: { price: "Custom", period: "tailored for you" },
    description: "For larger teams and enterprises that need custom limits, SLAs, and dedicated support.",
    features: [
      "Everything in Studio",
      "Custom AI usage limits",
      "Dedicated account manager",
      "Custom integrations",
      "SLA & uptime guarantee",
      "Invoiced billing",
    ],
    cta: "Talk to us",
    href: "/contact",
    featured: false,
    badge: null,
    paid: false,
  },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingPage() {
  const [currency, setCurrency] = useState<"usd" | "inr">("inr");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isSignedIn } = useAuth();
  const api = useApiClient();

  const handlePaidPlan = useCallback(
    async (planKey: "founder" | "studio") => {
      setLoadingPlan(planKey);
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error("Failed to load payment gateway. Please try again.");
          return;
        }

        // Fetch key from backend (keeps key server-side in env)
        const { keyId } = await api.get<{ keyId: string }>("/payments/key");

        const order = await api.post<{ orderId: string; amount: number; currency: string }>(
          "/payments/order",
          { plan: planKey, currency },
        );

        const rzp = new window.Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Lumiqs AI",
          description: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan`,
          order_id: order.orderId,
          theme: { color: "#6366f1" },
          handler: async (response: RazorpayResponse) => {
            try {
              await api.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planKey,
              });
              toast.success(`You're now on the ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan!`);
              // Redirect to dashboard after upgrade
              window.location.href = "/dashboard";
            } catch {
              toast.error("Payment received but plan upgrade failed. Contact support.");
            }
          },
          modal: {
            ondismiss: () => setLoadingPlan(null),
          },
        });

        rzp.open();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
        setLoadingPlan(null);
      }
    },
    [api, currency],
  );

  return (
    <PublicShell>
      <main>
        {/* Header */}
        <section className="mx-auto max-w-7xl px-5 pb-12 pt-20 text-center lg:px-8 lg:pt-28">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-400">
            Pricing that stays legible
          </p>
          <h1
            className="mx-auto mt-5 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl"
            style={{ color: "var(--page-fg)" }}
          >
            Start with one decision.{" "}
            <span className="gradient-text">Grow into a system.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8" style={{ color: "var(--muted-fg)" }}>
            Use Lumiqs free while you shape your context. Upgrade when the quality of your decisions becomes a weekly operating habit.
          </p>

          {/* Currency toggle */}
          <div
            className="mt-10 inline-flex items-center gap-1 rounded-full p-1"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <button
              onClick={() => setCurrency("usd")}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={
                currency === "usd"
                  ? { background: "var(--accent)", color: "#fff", boxShadow: "0 0 16px var(--accent-glow)" }
                  : { color: "var(--muted-fg)" }
              }
            >
              <DollarSign className="h-3.5 w-3.5" /> USD
            </button>
            <button
              onClick={() => setCurrency("inr")}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={
                currency === "inr"
                  ? { background: "var(--accent)", color: "#fff", boxShadow: "0 0 16px var(--accent-glow)" }
                  : { color: "var(--muted-fg)" }
              }
            >
              <IndianRupee className="h-3.5 w-3.5" /> INR
            </button>
          </div>
        </section>

        {/* Plans */}
        <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {plans.map((plan) => {
            const pricing = currency === "usd" ? plan.usd : plan.inr;
            const isCustom = plan.name === "Custom";
            const isLoading = loadingPlan === plan.planKey;

            return (
              <article
                key={plan.name}
                className="relative flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={
                  plan.featured
                    ? {
                        border: "1px solid rgba(99,102,241,.45)",
                        background: "rgba(99,102,241,.07)",
                        boxShadow: "0 20px 60px -10px rgba(99,102,241,.2)",
                      }
                    : { border: "1px solid var(--card-border)", background: "var(--card-bg)" }
                }
              >
                {plan.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] whitespace-nowrap"
                    style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 0 16px var(--accent-glow)" }}
                  >
                    {plan.badge}
                  </span>
                )}

                <h2 className="text-lg font-semibold" style={{ color: "var(--page-fg)" }}>{plan.name}</h2>
                <p className="mt-3 text-xs leading-5" style={{ color: "var(--muted-fg)" }}>{plan.description}</p>

                <div className="mt-6 flex items-end gap-1">
                  {isCustom ? (
                    <span className="text-3xl font-semibold" style={{ color: "var(--page-fg)" }}>Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-semibold" style={{ color: "var(--page-fg)" }}>{pricing.price}</span>
                      <span className="mb-0.5 text-xs" style={{ color: "var(--muted-fg)" }}>/ {pricing.period.replace("per ", "")}</span>
                    </>
                  )}
                </div>

                {!isCustom && currency === "inr" && plan.name !== "Explorer" && (
                  <p className="mt-1 text-[11px]" style={{ color: "var(--muted-fg)", opacity: 0.55 }}>
                    ≈ {plan.usd.price} USD
                  </p>
                )}

                {/* CTA button */}
                {plan.paid && isSignedIn ? (
                  <button
                    onClick={() => void handlePaidPlan(plan.planKey as "founder" | "studio")}
                    disabled={isLoading}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-60"
                    style={
                      plan.featured
                        ? { background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", color: "#fff", boxShadow: "0 0 20px var(--accent-glow)" }
                        : { border: "1px solid var(--line-strong)", color: "var(--muted-fg)", background: "var(--surface-raised)" }
                    }
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>{plan.cta} <ArrowRight className="h-3.5 w-3.5" /></>}
                  </button>
                ) : (
                  <Link
                    href={plan.paid && !isSignedIn ? `/sign-up?redirect=/pricing` : plan.href}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                    style={
                      plan.featured
                        ? { background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", color: "#fff", boxShadow: "0 0 20px var(--accent-glow)" }
                        : isCustom
                        ? { background: "var(--surface-raised)", border: "1px solid var(--accent)", color: "var(--accent)" }
                        : { border: "1px solid var(--line-strong)", color: "var(--muted-fg)", background: "var(--surface-raised)" }
                    }
                  >
                    {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}

                <ul className="mt-6 space-y-3 pt-6" style={{ borderTop: "1px solid var(--line)" }}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs" style={{ color: "var(--muted-fg)" }}>
                      <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>

        {/* Footer note */}
        <section className="mx-auto max-w-3xl px-5 pb-24 text-center lg:px-8">
          <p className="text-sm leading-7" style={{ color: "var(--muted-fg)" }}>
            Plans and usage limits may change during the product preview. INR pricing is approximate and subject to change. Lumiqs does not sell outcomes — AI guidance should be evaluated alongside your own business evidence.
          </p>
        </section>
      </main>
    </PublicShell>
  );
}
