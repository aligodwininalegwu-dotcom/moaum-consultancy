"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { contactAction } from "@/server/actions";
import { CONTACT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";

export function ContactForm() {
  const { register, handleSubmit, formState, reset, setError } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", category: "General Enquiry", subject: "", message: "" },
  });
  const e = formState.errors;

  const onSubmit = handleSubmit(async (values) => {
    const res = await contactAction(values);
    if (!res.ok) {
      Object.entries(res.fieldErrors ?? {}).forEach(([k, v]) => v?.[0] && setError(k as keyof ContactInput, { message: v[0] }));
      toast.error(res.error);
      return;
    }
    toast.success("Message sent", { description: res.message });
    reset();
  });

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-5 rounded-3xl border bg-card p-6 shadow-xl shadow-forest-900/5 sm:p-10">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Send a message</h2>
        <p className="mt-1 text-sm text-muted-foreground">We typically reply within two working days.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={e.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!e.name} {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" required error={e.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!e.email} {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={e.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
        </Field>
        <Field label="Service" htmlFor="category" required error={e.category?.message}>
          <NativeSelect id="category" {...register("category")}>
            {CONTACT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </NativeSelect>
        </Field>
      </div>
      <Field label="Subject" htmlFor="subject" required error={e.subject?.message}>
        <Input id="subject" aria-invalid={!!e.subject} {...register("subject")} />
      </Field>
      <Field label="Message" htmlFor="message" required error={e.message?.message}>
        <Textarea id="message" rows={6} aria-invalid={!!e.message} {...register("message")} />
      </Field>
      <Button type="submit" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        {formState.isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
