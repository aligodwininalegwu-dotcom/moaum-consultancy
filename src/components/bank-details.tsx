import { Landmark } from "lucide-react";
import { BANK_DETAILS } from "@/lib/constants";

const steps = [
  "Register for your programme to receive a reference (e.g. MOAUM-PR-2026-8H2LQ).",
  "Transfer the programme fee to the account below, using your reference as the narration.",
  "Enter the bank transaction reference in your dashboard.",
  "Our accounts officer verifies the payment and confirms your seat.",
];

/** Bank transfer instructions — the payment integration placeholder. */
export function BankDetails({ reference }: { reference?: string }) {
  return (
    <div className="overflow-clip rounded-2xl border bg-card">
      <div className="flex items-center gap-4 bg-gradient-to-r from-forest-800 to-forest-900 p-6 text-white">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold-300"><Landmark className="h-6 w-6" /></span>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/60">{BANK_DETAILS.bank}</p>
          <p className="font-mono text-2xl font-bold tracking-wider">{BANK_DETAILS.accountNumber}</p>
          <p className="text-sm text-white/80">{BANK_DETAILS.accountName}</p>
        </div>
      </div>
      <ol className="space-y-3 p-6 text-sm">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-xs font-bold text-gold-700 dark:text-gold-300">{i + 1}</span>
            <span className="text-muted-foreground">{s}</span>
          </li>
        ))}
      </ol>
      {reference && (
        <p className="border-t px-6 py-4 text-sm">
          Narration: <span className="font-mono font-semibold text-primary dark:text-forest-300">{reference}</span>
        </p>
      )}
    </div>
  );
}
