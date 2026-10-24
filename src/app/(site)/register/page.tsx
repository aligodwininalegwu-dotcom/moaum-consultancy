import type { Metadata } from "next";
import { AuthShell } from "@/components/forms/auth-shell";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Students, staff and members of the public are welcome.">
      <RegisterForm />
    </AuthShell>
  );
}
