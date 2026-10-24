"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { DynamicIcon } from "@/components/icon";
import { Badge } from "@/components/ui/primitives";
import { formatDate, formatNaira } from "@/lib/utils";

export type ProgrammeCardData = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  duration: string;
  mode: string;
  level: string;
  fee: number;
  seats: number;
  taken: number;
  startDate: string | Date;
  icon: string;
};

export function ProgrammeCard({ p }: { p: ProgrammeCardData }) {
  const left = Math.max(p.seats - p.taken, 0);
  const pct = Math.min(100, Math.round((p.taken / p.seats) * 100));

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group flex h-full flex-col overflow-clip rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-xl hover:shadow-forest-900/[0.07]"
    >
      <div className="relative overflow-clip bg-gradient-to-br from-forest-800 to-forest-950 p-6 text-white">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-gold-500/20 blur-2xl transition-transform duration-500 group-hover:scale-150" aria-hidden />
        <div className="relative flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold-300 ring-1 ring-white/15 backdrop-blur">
            <DynamicIcon name={p.icon} className="h-6 w-6" />
          </span>
          <Badge className="border-white/15 bg-white/10 text-white">{p.category === "SUMMER" ? "Summer" : "E-Learning"}</Badge>
        </div>
        <h3 className="relative mt-5 font-serif text-xl font-semibold leading-snug">{p.title}</h3>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-gold-600" /> {p.duration}</div>
          <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gold-600" /> {p.mode}</div>
          <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-gold-600" /> {formatDate(p.startDate)}</div>
          <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-gold-600" /> {left} seats left</div>
        </dl>
        <div className="mt-4 h-1.5 overflow-clip rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-forest-500 to-gold-500"
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(pct, 4)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="mt-6 flex items-end justify-between gap-3 border-t pt-5">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Fee</p>
            <p className="text-lg font-bold text-primary dark:text-forest-300">{formatNaira(p.fee)}</p>
          </div>
          <Link
            href={`/programmes/${p.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground dark:text-forest-200"
          >
            Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
