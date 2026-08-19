"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Bot, BarChart3, Globe, Users2,
  Lightbulb, Rocket, FileText, Settings, ChevronLeft, ChevronRight, Menu, X, Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "../theme-toggle";

const MAIN_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Businesses", href: "/businesses", icon: Building2 },
];

const BUSINESS_NAV = (id: string) => [
  { label: "AI Consultant", href: `/businesses/${id}/ai`, icon: Bot },
  { label: "Analysis", href: `/businesses/${id}/analysis`, icon: BarChart3 },
  { label: "Market Research", href: `/businesses/${id}/market-research`, icon: Globe },
  { label: "Competitors", href: `/businesses/${id}/competitors`, icon: Users2 },
  { label: "Strategy", href: `/businesses/${id}/strategy`, icon: Lightbulb },
  { label: "Execution", href: `/businesses/${id}/execution`, icon: Rocket },
  { label: "Reports", href: `/businesses/${id}/reports`, icon: FileText },
  { label: "Insights", href: `/businesses/${id}/insights`, icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const businessId = params?.id as string | undefined;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const businessNav = businessId ? BUSINESS_NAV(businessId) : [];

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
    const active = pathname === href || (href !== "/dashboard" && href !== "/businesses" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
          collapsed && "justify-center px-2",
        )}
        style={active
          ? { background: "rgba(99,102,241,.15)", color: "#a5b4fc" }
          : { color: "var(--muted-fg)" }
        }
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div
        className={cn("flex items-center gap-3 px-4 py-5", collapsed && "justify-center px-2")}
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          <img src="/logo.png" alt="Lumiqs AI" className="w-full h-full object-contain" />
        </div>
        {!collapsed && <span className="font-semibold text-sm" style={{ color: "var(--page-fg)" }}>Lumiqs AI</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {MAIN_NAV.map((item) => <NavLink key={item.href} {...item} />)}

        {businessNav.length > 0 && (
          <>
            {!collapsed && (
              <div className="px-3 pt-4 pb-1">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-fg)", opacity: 0.6 }}>Business</p>
              </div>
            )}
            {collapsed && <div className="my-2" style={{ borderTop: "1px solid var(--line)" }} />}
            {businessNav.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      <div
        className={cn("p-3 flex items-center gap-3", collapsed && "justify-center")}
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <UserButton afterSignOutUrl="/" />
        {!collapsed && (
          <>
            <Link href="/settings" aria-label="Settings" className="transition-colors hover:text-indigo-400" style={{ color: "var(--muted-fg)" }}>
              <Settings className="h-4 w-4" />
            </Link>
            <ThemeToggle compact />
          </>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full items-center justify-center transition-colors z-10"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--muted-fg)" }}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--muted-fg)" }}
      >
        <Menu className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64"
            style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--line)" }}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside
        className={cn("hidden lg:flex flex-col relative h-screen sticky top-0 transition-all duration-200 flex-shrink-0", collapsed ? "w-16" : "w-56")}
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--line)" }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
