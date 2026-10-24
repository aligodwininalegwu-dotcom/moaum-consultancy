import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle, StatCard } from "@/components/dashboard/shell";
import { BarList, Donut } from "@/components/dashboard/charts";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { CAMPUS_LABEL, STATUS_LABEL, type Campus } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [shops, appGroups, regs, users, recentApps, unread] = await Promise.all([
    prisma.shop.findMany({ select: { campus: true, status: true, annualRent: true } }),
    prisma.shopApplication.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.registration.findMany({ include: { programme: { select: { title: true, fee: true } } } }),
    prisma.user.count(),
    prisma.shopApplication.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { applicant: { select: { name: true } } } }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  const occupied = shops.filter((s) => s.status === "OCCUPIED");
  const occupancy = shops.length ? Math.round((occupied.length / shops.length) * 100) : 0;
  const rentRoll = occupied.reduce((sum, s) => sum + s.annualRent, 0);
  const paidRevenue = regs.filter((r) => r.paymentStatus === "PAID").reduce((sum, r) => sum + r.programme.fee, 0);
  const pendingApps = appGroups.filter((g) => g.status === "PENDING" || g.status === "UNDER_REVIEW").reduce((s, g) => s + g._count._all, 0);

  const byCampus = (["WESTERN", "EASTERN"] as Campus[]).map((c) => {
    const list = shops.filter((s) => s.campus === c);
    return {
      label: CAMPUS_LABEL[c],
      segments: [
        { label: "Occupied", value: list.filter((s) => s.status === "OCCUPIED").length, color: "#0A4D3C" },
        { label: "Available", value: list.filter((s) => s.status === "AVAILABLE").length, color: "#C9A227" },
        { label: "Reserved", value: list.filter((s) => s.status === "RESERVED").length, color: "#6dbea3" },
        { label: "Maintenance", value: list.filter((s) => s.status === "MAINTENANCE").length, color: "#e5a3a3" },
      ],
    };
  });

  const byProgramme = Object.entries(
    regs.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.programme.title]: (acc[r.programme.title] ?? 0) + 1 }), {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <PageTitle
        title="Overview"
        description="Allocation, registration and revenue at a glance."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><a href="/api/admin/export?type=shop-applications"><Download /> Applications CSV</a></Button>
            <Button asChild variant="outline" size="sm"><a href="/api/admin/export?type=registrations"><Download /> Registrations CSV</a></Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Applications to review" value={pendingApps} icon="ClipboardList" tone="gold" hint="Pending or under review" />
        <StatCard label="Shop occupancy" value={`${occupancy}%`} icon="Store" hint={`${occupied.length} of ${shops.length} shops · ${formatNaira(rentRoll)}/yr`} />
        <StatCard label="Programme revenue (paid)" value={formatNaira(paidRevenue)} icon="GraduationCap" tone="sky" hint={`${regs.length} registrations`} />
        <StatCard label="Registered users" value={users} icon="Users" tone="rose" hint={`${unread} unread message${unread === 1 ? "" : "s"}`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {byCampus.map((c) => (
          <section key={c.label} className="rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">{c.label} shops</h2>
            <Donut segments={c.segments} className="mt-6" />
          </section>
        ))}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Applications by status</h2>
          <BarList
            className="mt-6"
            items={["PENDING", "UNDER_REVIEW", "APPROVED", "ALLOCATED", "REJECTED"].map((s) => ({
              label: STATUS_LABEL[s],
              value: appGroups.find((g) => g.status === s)?._count._all ?? 0,
            }))}
          />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Registrations by programme</h2>
          <BarList className="mt-6" items={byProgramme} tone="gold" />
        </section>
        <section className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="font-semibold">Latest shop applications</h2>
            <Button asChild variant="link" size="sm"><Link href="/admin/shop-applications">View all <ArrowRight /></Link></Button>
          </div>
          <ul className="divide-y">
            {recentApps.map((a) => (
              <li key={a.id} className="flex items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.businessName}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.applicant.name} · {CAMPUS_LABEL[a.campus as Campus]} · {formatDate(a.createdAt)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
