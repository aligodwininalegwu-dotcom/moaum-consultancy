"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { navLinks } from "@/data/site";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  React.useEffect(() => setOpen(false), [pathname]);

  // Pages with a dark hero get a transparent, light-text navbar until scrolled.
  const overHero = !scrolled && !open;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const user = session?.user;
  const isConsole = user?.role === "ADMIN" || user?.role === "STAFF";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        overHero ? "bg-transparent" : "border-b bg-background/80 shadow-sm backdrop-blur-xl",
      )}
    >
      <nav className="container flex h-[72px] items-center justify-between gap-6">
        <Logo light={overHero} />

        <ul className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  overHero ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
                  isActive(link.href) && (overHero ? "text-white" : "text-foreground"),
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <ThemeToggle className={cn(overHero && "text-white hover:bg-white/10")} />

          {status === "loading" ? (
            <div className="hidden h-10 w-24 animate-pulse rounded-lg bg-muted/40 sm:block" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-forest-950 ring-2 ring-transparent transition hover:ring-gold-300 focus-visible:outline-none focus-visible:ring-gold-300"
                  aria-label="Account menu"
                >
                  {initials(user.name ?? "U")}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <p className="font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard /> My dashboard
                  </Link>
                </DropdownMenuItem>
                {isConsole && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShieldCheck /> Admin console
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <UserRound /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })} className="text-destructive">
                  <LogOut className="!text-destructive" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Button asChild variant="ghost" className={cn(overHero && "text-white hover:bg-white/10 hover:text-white")}>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="gold">
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-lg xl:hidden",
              overHero ? "text-white hover:bg-white/10" : "hover:bg-secondary",
            )}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-clip border-t bg-background xl:hidden"
          >
            <ul className="container flex flex-col gap-1 py-4">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-lg px-3 py-3 text-base font-medium",
                      isActive(link.href) ? "bg-secondary text-primary" : "hover:bg-secondary",
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              {!user && (
                <li className="mt-3 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild variant="gold">
                    <Link href="/register">Create account</Link>
                  </Button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
