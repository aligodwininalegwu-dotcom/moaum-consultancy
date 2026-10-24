import { prisma } from "@/lib/prisma";
import type { ProgrammeCardData } from "@/components/programme-card";

/** Programmes with the number of active (non-rejected) registrations. */
export async function getProgrammes(where: { category?: string; featured?: boolean } = {}): Promise<ProgrammeCardData[]> {
  const programmes = await prisma.programme.findMany({
    where: { active: true, ...where },
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
    include: { _count: { select: { registrations: { where: { status: { not: "REJECTED" } } } } } },
  });
  return programmes.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    summary: p.summary,
    duration: p.duration,
    mode: p.mode,
    level: p.level,
    fee: p.fee,
    seats: p.seats,
    taken: p._count.registrations,
    startDate: p.startDate.toISOString(),
    icon: p.icon,
  }));
}

export async function getShopSummary() {
  const groups = await prisma.shop.groupBy({ by: ["campus", "status"], _count: { _all: true } });
  const summary = {
    WESTERN: { total: 0, available: 0 },
    EASTERN: { total: 0, available: 0 },
  };
  for (const g of groups) {
    const campus = g.campus as keyof typeof summary;
    if (!summary[campus]) continue;
    summary[campus].total += g._count._all;
    if (g.status === "AVAILABLE") summary[campus].available += g._count._all;
  }
  return summary;
}
