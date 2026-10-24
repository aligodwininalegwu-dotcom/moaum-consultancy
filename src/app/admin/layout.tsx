import type { Metadata } from "next";
import { requireConsole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Admin console", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireConsole();
  const [pendingApps, pendingRegs, unread] = await Promise.all([
    prisma.shopApplication.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW"] } } }),
    prisma.registration.count({ where: { OR: [{ status: "PENDING" }, { paymentStatus: "AWAITING_VERIFICATION" }] } }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  return (
    <DashboardShell
      title="Admin console"
      user={{ name: user.name ?? "Admin", email: user.email ?? "", role: user.role }}
      nav={[
        { href: "/admin", label: "Overview", icon: "BarChart3", exact: true },
        { href: "/admin/shop-applications", label: "Shop applications", icon: "ClipboardList", badge: pendingApps },
        { href: "/admin/shops", label: "Shops register", icon: "Store" },
        { href: "/admin/registrations", label: "Registrations", icon: "GraduationCap", badge: pendingRegs },
        { href: "/admin/messages", label: "Messages", icon: "Inbox", badge: unread },
        ...(user.role === "ADMIN" ? [{ href: "/admin/users", label: "Users", icon: "Users" as const }] : []),
      ]}
      footerLink={{ href: "/dashboard", label: "My dashboard", icon: "LayoutDashboard" }}
    >
      {children}
    </DashboardShell>
  );
}
