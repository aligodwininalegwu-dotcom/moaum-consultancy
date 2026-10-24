"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { signupAction } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const { register, handleSubmit, formState, setError } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", matricNo: "", department: "", password: "", confirmPassword: "" },
  });
  const e = formState.errors;

  const onSubmit = handleSubmit(async (values) => {
    const res = await signupAction(values);
    if (!res.ok) {
      Object.entries(res.fieldErrors ?? {}).forEach(([k, v]) => v?.[0] && setError(k as keyof SignupInput, { message: v[0] }));
      toast.error(res.error);
      return;
    }
    toast.success("Account created", { description: "Signing you in…" });
    const login = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    router.push(login?.ok ? "/dashboard" : "/login");
    router.refresh();
  });

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="Full name" htmlFor="name" required error={e.name?.message}>
        <Input id="name" autoComplete="name" aria-invalid={!!e.name} {...register("name")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" required error={e.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!e.email} {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="phone" required error={e.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="08031234567" aria-invalid={!!e.phone} {...register("phone")} />
        </Field>
        <Field label="Matric / staff no." htmlFor="matricNo" hint="Optional">
          <Input id="matricNo" {...register("matricNo")} />
        </Field>
        <Field label="Department" htmlFor="department" hint="Optional">
          <Input id="department" {...register("department")} />
        </Field>
        <Field label="Password" htmlFor="password" required error={e.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!e.password} {...register("password")} />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" required error={e.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!e.confirmPassword} {...register("confirmPassword")} />
        </Field>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 className="animate-spin" />} Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline dark:text-forest-300">Sign in</Link>
      </p>
    </form>
  );
}
