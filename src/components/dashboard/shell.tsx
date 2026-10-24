"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ClipboardList,
  GraduationCap,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn, initials } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const ICONS = { BarChart3, ClipboardList, GraduationCap, Inbox, LayoutDashboard, ShieldCheck, Store, UserRound, Users, Home };
export type IconName = keyof typeof ICONS;

export function DashboardShell({
  title,
  nav,
  user,
  footerLink,
  children,
}: {
  title: string;
  nav: { href: string; label: string; icon: IconName; exact?: boolean; badge?: number }[];
  user: { name: string; email: string; role: string };
  footerLink?: { href: string; label: string; icon: IconName };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [pathname]);

  const isActive = (item: { href: string; exact?: boolean }) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  const sidebar = (
    <div className="flex h-full flex-col bg-forest-950 text-white">
      <div className="flex h-[72px] items-center px-6">
        <Logo light compact />
      </div>
      <p className="px-6 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{title}</p>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId={`side-active-${title}`}
                  className="absolute inset-0 rounded-lg bg-white/10 ring-1 ring-white/10"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-gold-400" />}
              <Icon className="relative h-[18px] w-[18px]" />
              <span className="relative flex-1">{item.label}</span>
              {!!item.badge && (
                <span className="relative rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-forest-950">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        {footerLink && (
          <Link href={footerLink.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">
            {React.createElement(ICONS[footerLink.icon], { className: "h-[18px] w-[18px]" })} {footerLink.label}
          </Link>
        )}
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">
          <Home className="h-[18px] w-[18px]" /> Back to website
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              {sidebar}
              <button onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-md p-2 text-white/70 hover:bg-white/10" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-8">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-secondary lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="hidden text-sm text-muted-foreground lg:block">{title}</p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user.role.toLowerCase()}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-forest-950">{initials(user.name)}</span>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon, hint, tone = "forest" }: { label: string; value: React.ReactNode; icon: IconName; hint?: string; tone?: "forest" | "gold" | "sky" | "rose" }) {
  const Icon = ICONS[icon];
  const tones = {
    forest: "bg-primary/10 text-primary dark:text-forest-300",
    gold: "bg-gold-500/15 text-gold-700 dark:text-gold-300",
    sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tones[tone])}><Icon className="h-[18px] w-[18px]" /></span>
      </div>
      <p className="mt-3 font-serif text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
