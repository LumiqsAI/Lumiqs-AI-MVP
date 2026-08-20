"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Bot, BarChart3, Globe, Users2,
  Lightbulb, Rocket, FileText, Settings, ChevronLeft, ChevronRight, Menu, X, Bookmark, ShieldCheck, GitCompare, Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ThemeToggle } from "../theme-toggle";
import { useApiClient } from "@/lib/api/client";

const MAIN_NAV = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Businesses", href: "/businesses", icon: Building2 },
];

const BUSINESS_NAV = (id: string) => [
  { label: "AI Consultant",   href: `/businesses/${id}/ai`,              icon: Bot },
  { label: "Analysis",        href: `/businesses/${id}/analysis`,        icon: BarChart3 },
  { label: "Market Research", href: `/businesses/${id}/market-research`, icon: Globe },
  { label: "Competitors",     href: `/businesses/${id}/competitors`,     icon: Users2 },
  { label: "Strategy",        href: `/businesses/${id}/strategy`,        icon: Lightbulb },
  { label: "Compare Scenarios", href: `/businesses/${id}/scenarios`,     icon: GitCompare },
  { label: "Challenge Strategy", href: `/businesses/${id}/challenge`,    icon: Swords },
  { label: "Execution",       href: `/businesses/${id}/execution`,       icon: Rocket },
  { label: "Reports",         href: `/businesses/${id}/reports`,         icon: FileText },
  { label: "Insights",        href: `/businesses/${id}/insights`,        icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const businessId = params?.id as string | undefined;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const api = useApiClient();

  useEffect(() => {
    api.get<{ role: string }>("/users/me").then((user) => {
      if (user.role === "admin") setIsAdmin(true);
    }).catch(() => {});
  }, [api]);

  const businessNav = businessId ? BUSINESS_NAV(businessId) : [];

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
    const active = pathname === href || (href !== "/dashboard" && href !== "/businesses" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
          collapsed && "justify-center px-2",
        )}
        style={active
          ? { background: "var(--nav-active-bg)", color: "var(--nav-active-fg)", fontWeight: 500 }
          : { color: "var(--muted-fg)" }
        }
        onMouseEnter={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
        }}
        onMouseLeave={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)";
        }}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn("flex items-center gap-2.5 px-4 py-5", collapsed && "justify-center px-2")}
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/logo.png" alt="Lumiqs AI" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--page-fg)" }}>
            Lumiqs AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {MAIN_NAV.map((item) => <NavLink key={item.href} {...item} />)}
        {isAdmin && <NavLink href="/admin" icon={ShieldCheck} label="Admin" />}

        {businessNav.length > 0 && (
          <>
            {!collapsed && (
              <div className="px-3 pt-5 pb-1.5">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--subtle-fg)" }}
                >
                  Business
                </p>
              </div>
            )}
            {collapsed && <div className="my-3" style={{ borderTop: "1px solid var(--line)" }} />}
            {businessNav.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      {/* Footer */}
      <div
        className={cn("p-3 flex items-center gap-2.5", collapsed && "justify-center")}
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <UserButton afterSignOutUrl="/" />
        {!collapsed && (
          <>
            <Link
              href="/settings"
              aria-label="Settings"
              className="transition-colors"
              style={{ color: "var(--muted-fg)" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)"}
            >
              <Settings className="h-4 w-4" />
            </Link>
            <ThemeToggle compact />
          </>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full items-center justify-center transition-colors z-10"
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--line-strong)",
          color: "var(--muted-fg)",
          boxShadow: "var(--card-shadow)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)"; }}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--line)",
          color: "var(--muted-fg)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-60"
            style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--line)" }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: "var(--muted-fg)" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--page-fg)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)"}
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col relative h-screen sticky top-0 transition-all duration-200 flex-shrink-0",
          collapsed ? "w-14" : "w-56",
        )}
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--line)" }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
