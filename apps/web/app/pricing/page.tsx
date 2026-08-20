"use client";

import Link from "next/link";
import { ArrowRight, Check, IndianRupee, DollarSign, Loader2, BadgeCheck } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
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
interface RazorpayInstance { open(): void; }
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Plan rank — higher = better plan
const PLAN_RANK: Record<string, number> = {
  explorer: 0,
  founder: 1,
  studio: 2,
  custom: 3,
};

const plans = [
  {
    name: "Explorer",
    planKey: "explorer" as const,
    usd: { price: "$0", period: "forever" },
    inr: { price: "₹0", period: "forever" },
    description: "Build your first business context and explore the Lumiqs method.",
    features: [
      "1 business workspace",
      "20 AI messages / month",
      "10 insights per business",
      "2 reports / month",
      "Business profile and memory",
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
      "200 AI messages / month",
      "100 insights per business",
      "20 reports / month",
      "Analysis, market research & competitors",
      "Strategy and execution plans",
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
      "1,000 AI messages / month",
      "Unlimited insights",
      "100 reports / month",
      "PDF export",
      "Priority support",
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
      "Unlimited AI usage",
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
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const api = useApiClient();

  // Fetch current plan only when signed in and Clerk is ready
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      if (isLoaded && !isSignedIn) setCurrentPlan(null);
      return;
    }
    setPlanLoading(true);
    api.get<{ plan: string }>("/users/plan")
      .then((r) => setCurrentPlan(r.plan))
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, [isSignedIn, isLoaded, api]);

  const handlePaidPlan = useCallback(
    async (planKey: "founder" | "studio") => {
      setLoadingPlan(planKey);
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error("Failed to load payment gateway. Please try again.");
          return;
        }

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
              window.location.href = "/dashboard";
            } catch {
              toast.error("Payment received but plan upgrade failed. Contact support.");
            }
          },
          modal: { ondismiss: () => setLoadingPlan(null) },
        });

        rzp.open();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
        setLoadingPlan(null);
      }
    },
    [api, currency],
  );

  const renderCta = (plan: typeof plans[number]) => {
    const isCustom = plan.planKey === "custom";
    const isCurrent = isSignedIn && currentPlan === plan.planKey;
    const isDowngrade = isSignedIn && currentPlan !== null &&
      PLAN_RANK[plan.planKey] < PLAN_RANK[currentPlan];
    const isLoading = loadingPlan === plan.planKey;

    const featuredStyle = {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      color: "#fff",
      boxShadow: "0 0 20px var(--accent-glow)",
    };
    const defaultStyle = {
      border: "1px solid var(--line-strong)",
      color: "var(--muted-fg)",
      background: "var(--surface-raised)",
    };
    const customStyle = {
      background: "var(--surface-raised)",
      border: "1px solid var(--accent)",
      color: "var(--accent)",
    };
    const currentStyle = {
      border: "1px solid rgba(99,102,241,.4)",
      color: "#a5b4fc",
      background: "rgba(99,102,241,.1)",
      cursor: "default",
    };
    const disabledStyle = {
      border: "1px solid var(--line)",
      color: "var(--muted-fg)",
      background: "var(--surface)",
      opacity: 0.45,
      cursor: "not-allowed",
    };

    // Show skeleton while Clerk is still loading
    if (!isLoaded) {
      return (
        <div
          className="mt-6 h-10 rounded-xl animate-pulse"
          style={{ background: "var(--surface-raised)" }}
        />
      );
    }

    // Current plan button
    if (isCurrent) {
      return (
        <div
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          style={currentStyle}
        >
          <BadgeCheck className="h-3.5 w-3.5" /> Current plan
        </div>
      );
    }

    // Downgrade — disabled
    if (isDowngrade) {
      return (
        <button
          disabled
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          style={disabledStyle}
          title="You cannot downgrade your plan"
        >
          Downgrade not available
        </button>
      );
    }

    // Paid plan — signed in → Razorpay
    if (plan.paid && isSignedIn) {
      return (
        <button
          onClick={() => void handlePaidPlan(plan.planKey as "founder" | "studio")}
          disabled={isLoading || planLoading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-60"
          style={plan.featured ? featuredStyle : defaultStyle}
        >
          {isLoading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <>{plan.cta} <ArrowRight className="h-3.5 w-3.5" /></>}
        </button>
      );
    }

    // Paid plan — not signed in → redirect to sign-up
    if (plan.paid && !isSignedIn) {
      return (
        <Link
          href="/sign-up?redirect=/pricing"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
          style={plan.featured ? featuredStyle : defaultStyle}
        >
          {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      );
    }

    // Custom plan
    if (isCustom) {
      return (
        <Link
          href="/contact"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
          style={customStyle}
        >
          {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      );
    }

    // Explorer — free plan
    return (
      <Link
        href={isSignedIn ? "/dashboard" : "/sign-up"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
        style={defaultStyle}
      >
        {isSignedIn ? "Go to dashboard" : plan.cta} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  };

  return (
    <PublicShell isAuthenticated={isLoaded && !!isSignedIn}>
      <main>
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

          <div
            className="mt-10 inline-flex items-center gap-1 rounded-full p-1"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <button
              onClick={() => setCurrency("usd")}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={currency === "usd"
                ? { background: "var(--accent)", color: "#fff", boxShadow: "0 0 16px var(--accent-glow)" }
                : { color: "var(--muted-fg)" }}
            >
              <DollarSign className="h-3.5 w-3.5" /> USD
            </button>
            <button
              onClick={() => setCurrency("inr")}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={currency === "inr"
                ? { background: "var(--accent)", color: "#fff", boxShadow: "0 0 16px var(--accent-glow)" }
                : { color: "var(--muted-fg)" }}
            >
              <IndianRupee className="h-3.5 w-3.5" /> INR
            </button>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {plans.map((plan) => {
            const pricing = currency === "usd" ? plan.usd : plan.inr;
            const isCustom = plan.planKey === "custom";
            const isCurrent = isSignedIn && currentPlan === plan.planKey;

            return (
              <article
                key={plan.name}
                className="relative flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={
                  isCurrent
                    ? { border: "1px solid rgba(99,102,241,.5)", background: "rgba(99,102,241,.06)", boxShadow: "0 0 0 1px rgba(99,102,241,.2)" }
                    : plan.featured
                    ? { border: "1px solid rgba(99,102,241,.45)", background: "rgba(99,102,241,.07)", boxShadow: "0 20px 60px -10px rgba(99,102,241,.2)" }
                    : { border: "1px solid var(--card-border)", background: "var(--card-bg)" }
                }
              >
                {/* Current plan badge takes priority over "Most popular" */}
                {isCurrent ? (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] whitespace-nowrap inline-flex items-center gap-1"
                    style={{ background: "#6366f1", color: "#fff" }}
                  >
                    <BadgeCheck className="h-3 w-3" /> Current plan
                  </span>
                ) : plan.badge ? (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] whitespace-nowrap"
                    style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 0 16px var(--accent-glow)" }}
                  >
                    {plan.badge}
                  </span>
                ) : null}

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

                {!isCustom && currency === "inr" && plan.planKey !== "explorer" && (
                  <p className="mt-1 text-[11px]" style={{ color: "var(--muted-fg)", opacity: 0.55 }}>
                    ≈ {plan.usd.price} USD
                  </p>
                )}

                {renderCta(plan)}

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

        <section className="mx-auto max-w-3xl px-5 pb-24 text-center lg:px-8">
          <p className="text-sm leading-7" style={{ color: "var(--muted-fg)" }}>
            Plans and usage limits may change during the product preview. INR pricing is approximate and subject to change. Lumiqs does not sell outcomes — AI guidance should be evaluated alongside your own business evidence.
          </p>
        </section>
      </main>
    </PublicShell>
  );
}
