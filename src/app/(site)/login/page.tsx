import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/forms/auth-shell";
import { LoginForm } from "@/components/forms/login-form";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthShell title="Sign in" subtitle="Access your applications, registrations and letters.">
      <Suspense fallback={<Skeleton className="h-64" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
