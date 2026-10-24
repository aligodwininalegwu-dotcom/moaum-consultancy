import Link from "next/link";
import { ArrowRight, Building, MapPin } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { CallToAction, ProcessSteps, ServiceCards, StatsBand, Testimonials } from "@/components/home/sections";
import { ProgrammeCard } from "@/components/programme-card";
import { SectionHeading } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getProgrammes, getShopSummary } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, shops] = await Promise.all([getProgrammes({ featured: true }), getShopSummary()]);

  return (
    <>
      <Hero />
      <ServiceCards />
      <StatsBand />

      {/* Campus availability */}
      <section className="py-24 sm:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Shop allocation"
            title="Commercial spaces on both campuses"
            description="Live availability from the allocation register. Apply online and the committee will review your proposal."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {(
              [
                ["WESTERN", "Western Campus", "Students' Centre, Faculty of Science axis and Hostel Road kiosks."],
                ["EASTERN", "Eastern Campus", "Shopping Arcade, College of Health Sciences axis and Main Gate kiosks."],
              ] as const
            ).map(([key, name, blurb], i) => (
              <Reveal key={key} delay={i * 0.1}>
                <div className="group relative overflow-clip rounded-3xl border bg-card p-8 transition-shadow hover:shadow-xl hover:shadow-forest-900/5">
                  <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-gold-500/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-gold-600" /> {name}
                      </p>
                      <p className="mt-4 font-serif text-5xl font-semibold text-primary dark:text-forest-300">
                        {shops[key].available}
                        <span className="ml-2 text-base font-sans font-medium text-muted-foreground">of {shops[key].total} available</span>
                      </p>
                    </div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold-300 dark:bg-forest-700">
                      <Building className="h-6 w-6" />
                    </span>
                  </div>
                  <p className="relative mt-4 text-sm text-muted-foreground">{blurb}</p>
                  <Button asChild variant="link" className="relative mt-4">
                    <Link href={`/shops?campus=${key}`}>
                      View {name} shops <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured programmes */}
      <section className="bg-secondary/40 py-24 dark:bg-transparent sm:py-28">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Featured programmes"
              title="Skills that open doors"
              description="Practical, certificate-bearing courses taught by University faculty and industry practitioners."
            />
            <Reveal>
              <Button asChild variant="outline">
                <Link href="/programmes">
                  All programmes <ArrowRight />
                </Link>
              </Button>
            </Reveal>
          </div>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((p) => (
              <StaggerItem key={p.slug}>
                <ProgrammeCard p={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <ProcessSteps />
      <Testimonials />
      <CallToAction />
    </>
  );
}
