import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "My dashboard", robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const isConsole = user.role === "ADMIN" || user.role === "STAFF";

  return (
    <DashboardShell
      title="My dashboard"
      user={{ name: user.name ?? "User", email: user.email ?? "", role: user.role }}
      nav={[
        { href: "/dashboard", label: "Overview", icon: "LayoutDashboard", exact: true },
        { href: "/dashboard/applications", label: "Shop applications", icon: "Store" },
        { href: "/dashboard/registrations", label: "Programme registrations", icon: "GraduationCap" },
        { href: "/dashboard/profile", label: "Profile", icon: "UserRound" },
      ]}
      footerLink={isConsole ? { href: "/admin", label: "Admin console", icon: "ShieldCheck" } : undefined}
    >
      {children}
    </DashboardShell>
  );
}
