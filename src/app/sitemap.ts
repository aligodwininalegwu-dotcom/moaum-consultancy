import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const programmes = await prisma.programme.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });
  const pages = ["", "/services", "/shops", "/programmes", "/about", "/contact"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [...pages, ...programmes.map((p) => ({ url: `${site.url}/programmes/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 }))];
}
