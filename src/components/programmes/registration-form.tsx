"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Loader2, LogIn } from "lucide-react";
import { registrationSchema, type RegistrationInput } from "@/lib/validations";
import { registerForProgramme } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";
import { formatNaira } from "@/lib/utils";
import { BANK_DETAILS } from "@/lib/constants";

export function RegistrationForm({
  programme,
  signedIn,
  defaultPhone,
  existing,
  full,
}: {
  programme: { id: string; title: string; fee: number; slug: string };
  signedIn: boolean;
  defaultPhone: string;
  existing: { reference: string; status: string } | null;
  full: boolean;
}) {
  const router = useRouter();
  const [reference, setReference] = React.useState<string | null>(null);
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { programmeId: programme.id, phone: defaultPhone, institution: "", motivation: "" },
  });
  const { register, handleSubmit, formState, setError } = form;

  const onSubmit = handleSubmit(async (values) => {
    const res = await registerForProgramme(values);
    if (!res.ok) {
      Object.entries(res.fieldErrors ?? {}).forEach(([k, v]) => v?.[0] && setError(k as keyof RegistrationInput, { message: v[0] }));
      toast.error(res.error);
      return;
    }
    setReference(res.data!.reference);
    toast.success("Registration received", { description: "Complete payment to confirm your seat." });
    router.refresh();
  });

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-forest-900/5">
      <div className="border-b bg-secondary/50 p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Programme fee</p>
        <p className="font-serif text-3xl font-semibold text-primary dark:text-forest-300">{formatNaira(programme.fee)}</p>
      </div>
      <div className="p-6">
        <AnimatePresence mode="wait" initial={false}>
          {reference || existing ? (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 15 }} className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </motion.span>
              <div>
                <p className="font-semibold">You are registered</p>
                <p className="mt-1 font-mono text-sm font-semibold text-gold-700 dark:text-gold-400">{reference ?? existing?.reference}</p>
                {existing && !reference && <StatusBadge status={existing.status} className="mt-2" />}
              </div>
              <p className="text-sm text-muted-foreground">
                Pay {formatNaira(programme.fee)} to {BANK_DETAILS.bank}, account <span className="font-mono font-semibold">{BANK_DETAILS.accountNumber}</span>, then submit your transaction reference in the dashboard.
              </p>
              <Button asChild className="w-full"><Link href="/dashboard/registrations">Go to my registrations</Link></Button>
            </motion.div>
          ) : !signedIn ? (
            <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
              <LogIn className="mx-auto h-8 w-8 text-gold-600" />
              <p className="text-sm text-muted-foreground">Sign in or create an account to register for this programme.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild><Link href={`/login?callbackUrl=/programmes/${programme.slug}`}>Sign in</Link></Button>
                <Button asChild variant="outline"><Link href="/register">Register</Link></Button>
              </div>
            </motion.div>
          ) : full ? (
            <p className="text-center text-sm text-muted-foreground">This programme is fully booked. Please check back for the next cohort.</p>
          ) : (
            <motion.form method="post" key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={onSubmit} noValidate className="space-y-5">
              <h2 className="font-semibold">Register for this programme</h2>
              <input type="hidden" {...register("programmeId")} />
              <Field label="Phone number" htmlFor="phone" required error={formState.errors.phone?.message}>
                <Input id="phone" type="tel" placeholder="08031234567" aria-invalid={!!formState.errors.phone} {...register("phone")} />
              </Field>
              <Field label="Institution / organisation" htmlFor="institution" hint="e.g. MOAU Makurdi, or your employer">
                <Input id="institution" {...register("institution")} />
              </Field>
              <Field label="Why do you want to take this course?" htmlFor="motivation">
                <Textarea id="motivation" rows={3} {...register("motivation")} />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
                {formState.isSubmitting && <Loader2 className="animate-spin" />}
                {formState.isSubmitting ? "Registering…" : "Complete registration"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Payment instructions appear after you register.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
