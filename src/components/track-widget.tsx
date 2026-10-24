"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { trackReferenceAction, type TrackResult } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { formatDate } from "@/lib/utils";

export function TrackWidget({ placeholder = "MOAUM-SA-2026-7KD2Q" }: { placeholder?: string }) {
  const [ref, setRef] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<TrackResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await trackReferenceAction(ref);
      if (res.ok) {
        setResult(res.data!);
        setError(null);
      } else {
        setResult(null);
        setError(res.error);
        toast.error(res.error);
      }
    });
  };

  return (
    <div>
      <form method="post" onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="track-ref" className="sr-only">Reference number</label>
        <Input
          id="track-ref"
          value={ref}
          onChange={(e) => setRef(e.target.value.toUpperCase())}
          placeholder={placeholder}
          className="h-12 font-mono tracking-wider"
          aria-invalid={!!error}
        />
        <Button type="submit" size="lg" disabled={pending || !ref.trim()}>
          {pending ? <Loader2 className="animate-spin" /> : <Search />} Track
        </Button>
      </form>
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.reference}
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 rounded-2xl border bg-background p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-gold-700 dark:text-gold-400">{result.reference}</p>
                  <p className="mt-1 font-semibold">{result.title}</p>
                  <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={result.status} />
                  {result.paymentStatus && <StatusBadge status={result.paymentStatus} />}
                </div>
              </div>
              <StatusTimeline type={result.type} status={result.status} className="mt-6" />
              {result.note && <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Note from the Unit: </span>{result.note}</p>}
              <p className="mt-4 text-xs text-muted-foreground">
                Submitted {formatDate(result.submittedAt)} · Last updated {formatDate(result.updatedAt)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
