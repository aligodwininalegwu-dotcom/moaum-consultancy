import type { Metadata } from "next";
import { Eye, Mail, Quote, Target } from "lucide-react";
import { leadership, objectives, site } from "@/data/site";
import { PageHero, SectionHeading } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Crest } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "About the Unit",
  description: "Mission, vision, objectives and leadership of the Consultancy Unit, Rev. Fr. Moses Orshio Adasu University, Makurdi.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the Unit"
        title="Putting University knowledge to work for our people"
        description={`The Consultancy Unit is the commercial and outreach arm of ${site.university} (${site.formerly}). We manage campus enterprise, run skills programmes and deliver expert services to the public and private sectors.`}
        crumbs={[{ href: "/about", label: "About" }]}
      />

      <section className="py-20">
        <div className="container grid gap-6 md:grid-cols-2">
          {[
            {
              icon: Target,
              title: "Our mission",
              body: "To harness the expertise, facilities and human resources of the University to provide high-quality, responsive services that generate sustainable revenue and contribute to the socio-economic development of Benue State and Nigeria.",
            },
            {
              icon: Eye,
              title: "Our vision",
              body: "To be the leading university consultancy and enterprise unit in North-Central Nigeria, recognised for integrity, excellence and impact.",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <div className="h-full rounded-3xl border bg-card p-8 sm:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold-300 dark:bg-forest-700"><c.icon className="h-6 w-6" /></span>
                <h2 className="mt-6 font-serif text-2xl font-semibold">{c.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-clip bg-forest-900 py-20 text-white">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="container relative grid items-center gap-12 lg:grid-cols-[auto_1fr]">
          <Reveal><Crest alt="Crest of Rev. Fr. Moses Orshio Adasu University, Makurdi" className="h-40 shadow-2xl ring-4 ring-gold-500/30" /></Reveal>
          <Reveal delay={0.1}>
            <Quote className="h-8 w-8 text-gold-400" />
            <p className="mt-4 font-serif text-3xl font-semibold italic sm:text-4xl">{site.motto}</p>
            <p className="mt-3 text-lg text-white/70">{site.mottoEnglish}. The University's motto guides how the Unit serves: knowledge applied for the benefit of the people.</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading align="left" eyebrow="Objectives" title="What the Unit sets out to achieve" />
          <Stagger className="space-y-3">
            {objectives.map((o, i) => (
              <StaggerItem key={i}>
                <div className="flex gap-5 rounded-2xl border bg-card p-5">
                  <span className="font-serif text-2xl font-semibold text-gold-500">{String(i + 1).padStart(2, "0")}</span>
                  <p className="pt-1 text-sm leading-relaxed">{o}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="leadership" className="scroll-mt-20 bg-secondary/50 py-20 dark:bg-secondary/20">
        <div className="container">
          <SectionHeading eyebrow="Leadership" title="Contact persons" description="Officers of the Unit responsible for each service area." />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((p) => (
              <StaggerItem key={p.email}>
                <div className="group h-full rounded-2xl border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-forest-600 to-forest-900 font-serif text-2xl font-semibold text-gold-300 ring-4 ring-gold-500/20 transition-all group-hover:ring-gold-500/50">
                    {p.initials}
                  </span>
                  <h3 className="mt-5 font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.role}</p>
                  <a href={`mailto:${p.email}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline dark:text-forest-300">
                    <Mail className="h-3.5 w-3.5" /> {p.email}
                  </a>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
