"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Copy, FileUp, Loader2, LogIn, Send } from "lucide-react";
import { shopApplicationSchema, type ShopApplicationInput } from "@/lib/validations";
import { submitShopApplication } from "@/server/actions";
import { ALLOWED_UPLOAD_TYPES, CAMPUS_LABEL, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, type Campus } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import type { ShopData } from "@/components/shops/shop-explorer";
import { cn, formatNaira } from "@/lib/utils";

type Files = { idDocument: File | null; proposalDocument: File | null };

function checkFile(file: File | null, label: string) {
  if (!file) return `${label} is required`;
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return "Upload a PDF, JPG or PNG file";
  if (file.size > MAX_UPLOAD_BYTES) return `File must be ${MAX_UPLOAD_LABEL} or smaller`;
  return undefined;
}

export const ShopApplicationForm = React.forwardRef<
  HTMLDivElement,
  { shops: ShopData[]; signedIn: boolean; selected: ShopData | null; defaultPhone?: string }
>(function ShopApplicationForm({ shops, signedIn, selected, defaultPhone }, ref) {
  const [files, setFiles] = React.useState<Files>({ idDocument: null, proposalDocument: null });
  const [fileErrors, setFileErrors] = React.useState<Partial<Record<keyof Files, string>>>({});
  const [submitted, setSubmitted] = React.useState<string | null>(null);

  const form = useForm<ShopApplicationInput>({
    resolver: zodResolver(shopApplicationSchema),
    defaultValues: {
      campus: (selected?.campus as Campus) ?? "WESTERN",
      preferredShopId: selected?.id ?? "",
      businessName: "",
      businessType: "",
      phone: defaultPhone ?? "",
      yearsExperience: 0,
      description: "",
      agree: false as unknown as true,
    },
  });
  const { register, handleSubmit, formState, watch, setValue, setError, reset } = form;
  const errors = formState.errors;
  const campus = watch("campus");

  // Selecting a shop card elsewhere on the page pre-fills the form.
  React.useEffect(() => {
    if (!selected) return;
    setValue("campus", selected.campus as Campus);
    setValue("preferredShopId", selected.id);
  }, [selected, setValue]);

  const available = shops.filter((s) => s.campus === campus && s.status === "AVAILABLE");

  const onSubmit = handleSubmit(async (values) => {
    const errs = {
      idDocument: checkFile(files.idDocument, "Means of identification"),
      proposalDocument: checkFile(files.proposalDocument, "Business proposal"),
    };
    setFileErrors(errs);
    if (errs.idDocument || errs.proposalDocument) return;

    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    fd.append("idDocument", files.idDocument!);
    fd.append("proposalDocument", files.proposalDocument!);

    const res = await submitShopApplication(fd);
    if (!res.ok) {
      Object.entries(res.fieldErrors ?? {}).forEach(([k, v]) => v?.[0] && setError(k as keyof ShopApplicationInput, { message: v[0] }));
      toast.error(res.error);
      return;
    }
    toast.success("Application submitted", { description: `Your reference is ${res.data!.reference}` });
    setSubmitted(res.data!.reference);
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
    reset();
    setFiles({ idDocument: null, proposalDocument: null });
  });

  return (
    <div ref={ref} id="apply" className="scroll-mt-24 rounded-3xl border bg-card p-6 shadow-xl shadow-forest-900/5 sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {!signedIn ? (
          <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-gold-300"><LogIn className="h-6 w-6" /></span>
            <h3 className="mt-5 font-serif text-2xl font-semibold">Sign in to apply</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Applications are linked to your account so you can track progress and download your allocation letter.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild><Link href="/login?callbackUrl=/shops%23apply">Sign in</Link></Button>
              <Button asChild variant="outline"><Link href="/register">Create account</Link></Button>
            </div>
          </motion.div>
        ) : submitted ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.span>
            <h3 className="mt-5 font-serif text-2xl font-semibold">Application received</h3>
            <p className="mt-2 text-sm text-muted-foreground">Keep this reference to track your application:</p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(submitted);
                toast.success("Reference copied");
              }}
              className="mx-auto mt-4 flex items-center gap-2 rounded-xl border border-dashed border-gold-500/50 bg-gold-500/10 px-5 py-3 font-mono text-lg font-bold tracking-wider text-gold-800 dark:text-gold-300"
            >
              {submitted} <Copy className="h-4 w-4" />
            </button>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild><Link href="/dashboard">Go to dashboard</Link></Button>
              <Button variant="outline" onClick={() => setSubmitted(null)}>New application</Button>
            </div>
          </motion.div>
        ) : (
          <motion.form method="post" key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={onSubmit} noValidate className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-semibold">Shop application form</h3>
              <p className="mt-1 text-sm text-muted-foreground">Fields marked * are required. Documents must be PDF, JPG or PNG (max. {MAX_UPLOAD_LABEL} each).</p>
            </div>

            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="mb-4 text-xs font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-400">1 · Location</legend>
              <Field label="Campus" htmlFor="campus" required error={errors.campus?.message}>
                <NativeSelect id="campus" {...register("campus", { onChange: () => setValue("preferredShopId", "") })} value={campus}>
                  {(["WESTERN", "EASTERN"] as const).map((c) => (
                    <option key={c} value={c}>{CAMPUS_LABEL[c]}</option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Preferred shop" htmlFor="preferredShopId" hint="Optional: the committee may offer an alternative.">
                {/* Controlled so a value set before the campus's options render still sticks. */}
                <NativeSelect id="preferredShopId" {...register("preferredShopId")} value={watch("preferredShopId") ?? ""}>
                  <option value="">No preference</option>
                  {available.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} · {s.category} · {s.sizeSqm} m² · {formatNaira(s.annualRent)}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </fieldset>

            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="mb-4 text-xs font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-400">2 · Business details</legend>
              <Field label="Business name" htmlFor="businessName" required error={errors.businessName?.message}>
                <Input id="businessName" placeholder="e.g. Iorliam Digital Hub" aria-invalid={!!errors.businessName} {...register("businessName")} />
              </Field>
              <Field label="Type of business" htmlFor="businessType" required error={errors.businessType?.message}>
                <Input id="businessType" placeholder="e.g. Printing & business centre" aria-invalid={!!errors.businessType} {...register("businessType")} />
              </Field>
              <Field label="Phone number" htmlFor="phone" required error={errors.phone?.message}>
                <Input id="phone" type="tel" placeholder="08031234567" aria-invalid={!!errors.phone} {...register("phone")} />
              </Field>
              <Field label="Years of experience" htmlFor="yearsExperience" error={errors.yearsExperience?.message}>
                <Input id="yearsExperience" type="number" min={0} max={60} {...register("yearsExperience")} />
              </Field>
              <Field label="Business description" htmlFor="description" required className="sm:col-span-2" error={errors.description?.message} hint="What you will sell or offer, target customers, opening hours and staffing.">
                <Textarea id="description" rows={5} aria-invalid={!!errors.description} {...register("description")} />
              </Field>
            </fieldset>

            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="mb-4 text-xs font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-400">3 · Documents</legend>
              {(
                [
                  ["idDocument", "Means of identification", "Student/staff ID, NIN slip, driver's licence or passport"],
                  ["proposalDocument", "Business proposal", "A short proposal document (PDF preferred)"],
                ] as const
              ).map(([key, label, hint]) => (
                <Field key={key} label={label} htmlFor={key} required error={fileErrors[key]} hint={hint}>
                  <label
                    htmlFor={key}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors hover:border-primary/40 hover:bg-secondary/50",
                      files[key] && "border-emerald-500/40 bg-emerald-500/5",
                      fileErrors[key] && "border-destructive/50",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary dark:text-forest-300">
                      {files[key] ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <FileUp className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0 text-sm">
                      <span className="block truncate font-medium">{files[key]?.name ?? "Choose a file"}</span>
                      <span className="block text-xs text-muted-foreground">
                        {files[key] ? `${(files[key]!.size / 1024).toFixed(0)} KB` : `PDF, JPG or PNG up to ${MAX_UPLOAD_LABEL}`}
                      </span>
                    </span>
                    <input
                      id={key}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setFiles((f) => ({ ...f, [key]: file }));
                        setFileErrors((fe) => ({ ...fe, [key]: file ? checkFile(file, label) : undefined }));
                      }}
                    />
                  </label>
                </Field>
              ))}
            </fieldset>

            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#0A4D3C]" {...register("agree")} />
                <span className="text-muted-foreground">
                  I confirm the information provided is accurate and I agree to abide by the{" "}
                  <a href="#guidelines" className="font-medium text-primary underline-offset-4 hover:underline dark:text-forest-300">allocation guidelines</a>{" "}
                  and University regulations.
                </span>
              </label>
              {errors.agree && <p className="text-xs font-medium text-destructive">{errors.agree.message}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
              {formState.isSubmitting ? "Submitting…" : "Submit application"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
});
