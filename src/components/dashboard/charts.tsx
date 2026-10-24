"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Horizontal bars with animated fill; values labelled directly. */
export function BarList({ items, tone = "forest", className }: { items: { label: string; value: number }[]; tone?: "forest" | "gold"; className?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className={cn("text-sm text-muted-foreground", className)}>No data yet.</p>;
  return (
    <ul className={cn("space-y-3.5", className)}>
      {items.map((item, i) => (
        <li key={item.label}>
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate text-muted-foreground">{item.label}</span>
            <span className="font-semibold tabular-nums">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn("h-full rounded-full", tone === "gold" ? "bg-gold-500" : "bg-forest-600 dark:bg-forest-400")}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Donut with legend; segments drawn as stroked circle arcs. */
export function Donut({ segments, className }: { segments: { label: string; value: number; color: string }[]; className?: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <motion.circle
              key={s.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.12 }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto pl-3 font-semibold tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
