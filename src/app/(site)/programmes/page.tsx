import type { Metadata } from "next";
import Link from "next/link";
import { MonitorPlay, Sun, LayoutGrid } from "lucide-react";
import { getProgrammes } from "@/server/queries";
import { programmeFaqs } from "@/data/site";
import { PageHero, SectionHeading } from "@/components/layout/page-hero";
import { ProgrammeCard } from "@/components/programme-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BankDetails } from "@/components/bank-details";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Programmes & Registration",
  description: "E-learning courses and Summer Computer Programmes, including Website Design and Microsoft Office Proficiency, at MOAU Makurdi.",
};
export const dynamic = "force-dynamic";

const filters = [
  { key: "ALL", label: "All programmes", icon: LayoutGrid },
  { key: "SUMMER", label: "Summer Computer Programmes", icon: Sun },
  { key: "ELEARNING", label: "E-Learning", icon: MonitorPlay },
] as const;

export default async function ProgrammesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = category === "SUMMER" || category === "ELEARNING" ? category : "ALL";
  const programmes = await getProgrammes(active === "ALL" ? {} : { category: active });

  return (
    <>
      <PageHero
        eyebrow="Programmes"
        title="Learn practical skills with certified programmes"
        description="Choose from intensive on-campus Summer Computer Programmes or flexible E-Learning courses. Register online and pay by bank transfer."
        crumbs={[{ href: "/programmes", label: "Programmes" }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container">
          <nav className="flex flex-wrap gap-2" aria-label="Programme categories">
            {filters.map((f) => (
              <Link
                key={f.key}
                href={f.key === "ALL" ? "/programmes" : `/programmes?category=${f.key}`}
                scroll={false}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  active === f.key ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:border-primary/40 hover:bg-secondary",
                )}
              >
                <f.icon className="h-4 w-4" /> {f.label}
              </Link>
            ))}
          </nav>

          <Stagger key={active} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programmes.map((p) => (
              <StaggerItem key={p.slug}>
                <ProgrammeCard p={p} />
              </StaggerItem>
            ))}
          </Stagger>
          {programmes.length === 0 && <p className="mt-10 text-center text-muted-foreground">No programmes are open in this category right now.</p>}
        </div>
      </section>

      <section className="bg-secondary/50 py-20 dark:bg-secondary/20">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Payment" title="How to pay" description="We currently accept payment by bank transfer. Online card payment is coming soon." />
            <Reveal delay={0.1} className="mt-8">
              <BankDetails />
            </Reveal>
          </div>
          <div>
            <SectionHeading align="left" eyebrow="FAQs" title="Questions about programmes" />
            <Reveal delay={0.1} className="mt-6">
              <Accordion type="single" collapsible>
                {programmeFaqs.map((f, i) => (
                  <AccordionItem key={i} value={`p-${i}`}>
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
