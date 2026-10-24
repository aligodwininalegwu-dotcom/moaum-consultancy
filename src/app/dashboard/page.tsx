import Link from "next/link";
import { ArrowRight, GraduationCap, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageTitle, StatCard } from "@/components/dashboard/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function DashboardHome() {
  const user = await requireUser();
  const [apps, regs] = await Promise.all([
    prisma.shopApplication.findMany({ where: { applicantId: user.id }, orderBy: { createdAt: "desc" }, include: { allocatedShop: true } }),
    prisma.registration.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { programme: true } }),
  ]);

  const activity = [
    ...apps.map((a) => ({ id: a.id, kind: "shop" as const, title: a.businessName, sub: `${a.campus === "WESTERN" ? "Western" : "Eastern"} Campus`, ref: a.reference, status: a.status, date: a.updatedAt })),
    ...regs.map((r) => ({ id: r.id, kind: "programme" as const, title: r.programme.title, sub: r.programme.duration, ref: r.reference, status: r.status, date: r.updatedAt })),
  ].sort((a, b) => +b.date - +a.date);

  const unpaid = regs.filter((r) => r.paymentStatus === "UNPAID").length;
  const letters = apps.filter((a) => a.status === "ALLOCATED").length + regs.filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED").length;

  return (
    <div>
      <PageTitle title={`Welcome, ${user.name?.split(" ")[0] ?? ""}`} description="Here is a summary of your applications and registrations." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Shop applications" value={apps.length} icon="Store" />
        <StatCard label="Programme registrations" value={regs.length} icon="GraduationCap" tone="gold" />
        <StatCard label="Awaiting payment" value={unpaid} icon="ClipboardList" tone="rose" hint={unpaid ? "Submit your transfer reference" : "Nothing outstanding"} />
        <StatCard label="Letters available" value={letters} icon="ShieldCheck" tone="sky" hint="Download from each record" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="font-semibold">Recent activity</h2>
          </div>
          {activity.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">No applications yet. Start with a shop application or programme registration.</p>
          ) : (
            <ul className="divide-y">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <Link
                    href={a.kind === "shop" ? "/dashboard/applications" : "/dashboard/registrations"}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary dark:text-forest-300">
                      {a.kind === "shop" ? <Store className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono">{a.ref}</span> · {a.sub} · {formatDate(a.date)}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          {[
            { icon: Store, title: "Apply for a shop", body: "Western and Eastern Campus spaces.", href: "/shops#apply" },
            { icon: GraduationCap, title: "Register for a programme", body: "E-learning and summer courses.", href: "/programmes" },
          ].map((c) => (
            <Link key={c.title} href={c.href} className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold-300 dark:bg-forest-700"><c.icon className="h-6 w-6" /></span>
              <span className="flex-1">
                <span className="block font-semibold">{c.title}</span>
                <span className="block text-sm text-muted-foreground">{c.body}</span>
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
          <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5">
            <p className="font-semibold">Need help?</p>
            <p className="mt-1 text-sm text-muted-foreground">Contact the Consultancy Unit for questions about your application.</p>
            <Button asChild variant="outline" size="sm" className="mt-4"><Link href="/contact">Contact us</Link></Button>
          </div>
        </section>
      </div>
    </div>
  );
}
