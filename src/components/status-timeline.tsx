"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FLOWS = {
  shop: ["PENDING", "UNDER_REVIEW", "APPROVED", "ALLOCATED"],
  programme: ["PENDING", "CONFIRMED", "COMPLETED"],
} as const;

const LABELS: Record<string, string> = {
  PENDING: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  ALLOCATED: "Allocated",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
};

/** Horizontal progress steps for an application's lifecycle. */
export function StatusTimeline({ type, status, className }: { type: "shop" | "programme"; status: string; className?: string }) {
  const flow = FLOWS[type] as readonly string[];
  const rejected = status === "REJECTED";
  // A rejected application stopped after review.
  const current = rejected ? (type === "shop" ? 1 : 0) : Math.max(flow.indexOf(status), 0);

  return (
    <ol className={cn("flex items-start", className)}>
      {flow.map((step, i) => {
        const done = i <= current;
        const failed = rejected && i === current + 1;
        const label = failed ? "Rejected" : LABELS[step];
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span className="absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 bg-muted">
                <motion.span
                  className={cn("block h-full", failed ? "bg-red-500" : "bg-gold-500")}
                  initial={{ width: 0 }}
                  animate={{ width: done || failed ? "100%" : "0%" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                />
              </span>
            )}
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.1, type: "spring", stiffness: 300, damping: 18 }}
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                done && "border-gold-500 bg-gold-500 text-forest-950",
                failed && "border-red-500 bg-red-500 text-white",
                !done && !failed && "border-muted bg-background text-muted-foreground",
              )}
            >
              {failed ? <X className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : i + 1}
            </motion.span>
            <span className={cn("mt-2 text-[11px] font-medium sm:text-xs", done || failed ? "text-foreground" : "text-muted-foreground")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
