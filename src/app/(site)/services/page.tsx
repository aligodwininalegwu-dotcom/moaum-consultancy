import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MonitorPlay, Store, Sun } from "lucide-react";
import { otherServices } from "@/data/site";
import { getProgrammes, getShopSummary } from "@/server/queries";
import { PageHero, SectionHeading } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { DynamicIcon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
  description: "Shop allocation, e-learning, summer computer programmes, career guidance, training and facility booking at MOAU Makurdi.",
};
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [shops, summer, elearning] = await Promise.all([
    getShopSummary(),
    getProgrammes({ category: "SUMMER" }),
    getProgrammes({ category: "ELEARNING" }),
  ]);

  const primary = [
    {
      id: "shop-allocation",
      icon: Store,
      eyebrow: "Western & Eastern Campus",
      title: "Shop Allocation",
      body: "The Unit manages the University's commercial spaces, from business centres and restaurants to retail units and kiosks. Applications are screened by an allocation committee against published criteria, and every decision is recorded and communicated online.",
      points: [
        `${shops.WESTERN.available} shops available on the Western Campus`,
        `${shops.EASTERN.available} shops available on the Eastern Campus`,
        "Upload ID and business proposal online",
        "Track status and download your allocation letter",
      ],
      href: "/shops",
      cta: "Apply for a shop",
    },
    {
      id: "e-learning",
      icon: MonitorPlay,
      eyebrow: "Online · Self-paced + live",
      title: "E-Learning Programme",
      body: "Flexible online courses for students, staff and the wider public, combining recorded lessons with scheduled live sessions and mentor support.",
      points: elearning.slice(0, 4).map((p) => `${p.title} (${p.duration}, ${formatNaira(p.fee)})`),
      href: "/programmes?category=ELEARNING",
      cta: "Browse e-learning courses",
    },
    {
      id: "summer",
      icon: Sun,
      eyebrow: "On-campus · July – August",
      title: "Summer Computer Programmes",
      body: "Intensive, hands-on courses delivered in the University ICT Centre during the long vacation, ideal for students, school leavers and working professionals.",
      points: summer.slice(0, 5).map((p) => `${p.title} (${p.duration}, ${formatNaira(p.fee)})`),
      href: "/programmes?category=SUMMER",
      cta: "View summer courses",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Professional services for the University and its community"
        description="From commercial space allocation to certified skills programmes and expert consultancy, the Unit connects University resources to real needs."
        crumbs={[{ href: "/services", label: "Services" }]}
      />

      <section className="py-20">
        <div className="container space-y-8">
          {primary.map((s, i) => (
            <Reveal key={s.id}>
              <article id={s.id} className="grid scroll-mt-24 overflow-clip rounded-3xl border bg-card lg:grid-cols-[1fr_1.1fr]">
                <div className={`relative overflow-clip bg-gradient-to-br from-forest-800 to-forest-950 p-10 text-white ${i % 2 ? "lg:order-2" : ""}`}>
                  <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
                  <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" aria-hidden />
                  <div className="relative">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold-300 ring-1 ring-white/15">
                      <s.icon className="h-7 w-7" />
                    </span>
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">{s.eyebrow}</p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">{s.title}</h2>
                    <p className="mt-4 leading-relaxed text-white/70">{s.body}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <ul className="space-y-3.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className="group mt-8 self-start">
                    <Link href={s.href}>
                      {s.cta} <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="other-services" className="scroll-mt-20 bg-secondary/50 py-20 dark:bg-secondary/20">
        <div className="container">
          <SectionHeading
            eyebrow="Consultancy services"
            title="Additional services for individuals and organisations"
            description="Send an enquiry through the contact form, choosing the relevant service, and the Unit will respond with availability and costs."
          />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {otherServices.map((s) => (
              <StaggerItem key={s.title}>
                <div className="group h-full rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-lg">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700 transition-colors group-hover:bg-gold-500 group-hover:text-forest-950 dark:text-gold-300">
                    <DynamicIcon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 text-center">
            <Button asChild size="lg" variant="gold">
              <Link href="/contact">Make an enquiry <ArrowRight /></Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
