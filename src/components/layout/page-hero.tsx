import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/** Dark banner used at the top of every inner page (the navbar sits over it). */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs = [],
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-clip bg-forest-900 pb-16 pt-36 text-white sm:pb-20 sm:pt-40">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" aria-hidden />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-forest-500/30 blur-3xl" aria-hidden />
      <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" aria-hidden />
      <div className="container relative">
        <Reveal>
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-white/55">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            {crumbs.map((c) => (
              <span key={c.href} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                <Link href={c.href} className="hover:text-white">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
          {eyebrow && (
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              <span className="h-px w-8 bg-gold-400" /> {eyebrow}
            </p>
          )}
          <h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.1] sm:text-5xl">{title}</h1>
          {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
          <span className="h-px w-6 bg-current" /> {eyebrow}
        </p>
      )}
      <h2 className="text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>}
    </Reveal>
  );
}
