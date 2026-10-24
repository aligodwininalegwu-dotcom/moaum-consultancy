import type { Metadata } from "next";
import { FileCheck2, ScrollText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { shopFaqs, shopGuidelines } from "@/data/site";
import { PageHero, SectionHeading } from "@/components/layout/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ShopsClient } from "@/components/shops/shops-client";
import { TrackWidget } from "@/components/track-widget";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CAMPUSES, type Campus } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shop Allocation",
  description: "Apply for commercial shops on the Western and Eastern Campuses of Rev. Fr. Moses Orshio Adasu University, Makurdi.",
};
export const dynamic = "force-dynamic";

export default async function ShopsPage({ searchParams }: { searchParams: Promise<{ campus?: string }> }) {
  const { campus } = await searchParams;
  const initialCampus: Campus = CAMPUSES.includes(campus as Campus) ? (campus as Campus) : "WESTERN";

  const [shops, session] = await Promise.all([
    prisma.shop.findMany({ orderBy: [{ campus: "desc" }, { code: "asc" }] }),
    getSession(),
  ]);
  const user = session?.user ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true } }) : null;
  const total = shops.length;
  const available = shops.filter((s) => s.status === "AVAILABLE").length;

  return (
    <>
      <PageHero
        eyebrow="Shop Allocation"
        title="Campus commercial spaces, allocated fairly and transparently"
        description="Browse shops on the Western and Eastern Campuses, check live availability, and submit your application online with supporting documents."
        crumbs={[{ href: "/shops", label: "Shop Allocation" }]}
      >
        <div className="flex flex-wrap gap-8 text-sm">
          <div><p className="font-serif text-3xl font-semibold text-gold-300">{available}</p><p className="text-white/60">shops available now</p></div>
          <div><p className="font-serif text-3xl font-semibold text-gold-300">{total}</p><p className="text-white/60">shops on the register</p></div>
          <div><p className="font-serif text-3xl font-semibold text-gold-300">10</p><p className="text-white/60">working days to screen</p></div>
        </div>
      </PageHero>

      <section className="py-20">
        <div className="container">
          <SectionHeading align="left" eyebrow="Availability" title="Find a shop" description="Filter by campus and category. Select an available shop to pre-fill the application form." />
          <div className="mt-10">
            <ShopsClient
              shops={shops.map((s) => ({ ...s, features: s.features.split(",").filter(Boolean) }))}
              initialCampus={initialCampus}
              signedIn={!!session?.user}
              defaultPhone={user?.phone ?? undefined}
            />
          </div>
        </div>
      </section>

      <section id="guidelines" className="scroll-mt-20 bg-secondary/50 py-20 dark:bg-secondary/20">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading align="left" eyebrow="Guidelines" title="Before you apply" description="Please read the allocation guidelines carefully. Incomplete applications will not be considered." />
            <Reveal delay={0.1} className="mt-8 rounded-2xl border bg-card p-6">
              <p className="flex items-center gap-2 font-semibold"><FileCheck2 className="h-5 w-5 text-gold-600" /> Checklist</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• A valid means of identification</li>
                <li>• A business proposal (PDF, max. 2 MB)</li>
                <li>• An active phone number</li>
                <li>• Food vendors: a food handler's certificate at interview</li>
              </ul>
            </Reveal>
          </div>
          <div className="space-y-4">
            {shopGuidelines.map((g, i) => (
              <Reveal key={g.title} delay={i * 0.06}>
                <div className="flex gap-5 rounded-2xl border bg-card p-6 transition-colors hover:border-gold-500/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-serif text-sm font-semibold text-gold-300 dark:bg-forest-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold">{g.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="track" className="scroll-mt-20 py-20">
        <div className="container grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border bg-card p-8 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-400"><ScrollText className="h-4 w-4" /> Status tracking</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold">Track your application</h2>
              <p className="mt-2 text-sm text-muted-foreground">Enter the reference number you received after submitting. Try the sample reference shown.</p>
              <div className="mt-6">
                <TrackWidget />
              </div>
            </div>
          </Reveal>
          <div>
            <SectionHeading align="left" eyebrow="FAQs" title="Frequently asked questions" />
            <Reveal delay={0.1} className="mt-6">
              <Accordion type="single" collapsible>
                {shopFaqs.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{f.q}</AccordionTrigger>
                    <AccordionContent>{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
