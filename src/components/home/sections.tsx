"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Briefcase, ChevronLeft, ChevronRight, ClipboardCheck, FileSearch, GraduationCap, KeyRound, MonitorPlay, Quote, Store, UserPlus } from "lucide-react";
import { stats, testimonials } from "@/data/site";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const services = [
  {
    href: "/shops",
    icon: Store,
    title: "Shop Allocation",
    body: "Apply for commercial spaces on the Western and Eastern Campuses, upload documents and track your application online.",
    tag: "Western & Eastern",
  },
  {
    href: "/programmes?category=ELEARNING",
    icon: MonitorPlay,
    title: "E-Learning",
    body: "Flexible online courses in digital literacy, programming, research methods and entrepreneurship.",
    tag: "Self-paced + live",
  },
  {
    href: "/programmes?category=SUMMER",
    icon: GraduationCap,
    title: "Summer Programmes",
    body: "Intensive hands-on computer courses: website design, Microsoft Office, data analysis and more.",
    tag: "July – August",
  },
  {
    href: "/services#other-services",
    icon: Briefcase,
    title: "Consultancy Services",
    body: "Career guidance, training workshops, facility booking and research advisory for organisations.",
    tag: "For individuals & orgs",
  },
];

export function ServiceCards() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="What we do"
          title="Services built for students, staff and our community"
          description="Everything the Consultancy Unit offers is now available online, with clear guidelines, fair processes and real-time updates."
        />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <StaggerItem key={s.title}>
              <Link href={s.href} className="group block h-full">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="relative flex h-full flex-col overflow-clip rounded-2xl border bg-card p-7 shadow-sm transition-shadow duration-300 group-hover:border-primary/25 group-hover:shadow-xl group-hover:shadow-forest-900/[0.07]"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-500/0 blur-2xl transition-colors duration-500 group-hover:bg-gold-500/20" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold-300 shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:bg-forest-700">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400">{s.tag}</p>
                  <h3 className="mt-1.5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary dark:text-forest-300">
                    Learn more <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function StatsBand() {
  return (
    <section className="relative overflow-clip bg-primary py-16 text-white dark:bg-forest-900">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="container relative grid grid-cols-2 gap-y-10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center lg:border-l lg:border-white/10 lg:first:border-l-0">
            <CountUp value={s.value} suffix={s.suffix} className="font-serif text-4xl font-semibold text-gold-300 sm:text-5xl" />
            <p className="mt-2 text-sm text-white/70">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { icon: UserPlus, title: "Create an account", body: "Register with your email and phone number in under a minute." },
  { icon: FileSearch, title: "Choose a service", body: "Browse available shops or programmes and read the guidelines." },
  { icon: ClipboardCheck, title: "Apply & upload", body: "Complete the online form and attach your ID and proposal." },
  { icon: KeyRound, title: "Track & receive", body: "Follow your status and download your official letter." },
];

export function ProcessSteps() {
  return (
    <section className="py-24 sm:py-28">
      <div className="container grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            align="left"
            eyebrow="How it works"
            title="From application to allocation in four clear steps"
            description="No more paper forms or repeated office visits. Every application is logged, reviewed by the committee and updated in your dashboard."
          />
          <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">
                Get started <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/shops#track">Track an application</Link>
            </Button>
          </Reveal>
        </div>
        <Stagger className="relative grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <StaggerItem key={s.title}>
              <div className="relative h-full rounded-2xl border bg-card p-6 transition-colors hover:border-gold-500/40">
                <span className="absolute right-5 top-4 font-serif text-5xl font-semibold text-muted-foreground/15">0{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700 dark:text-gold-300">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Testimonials() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = testimonials.length;
  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(t);
  }, [paused, count]);

  const t = testimonials[index];

  return (
    <section className="relative overflow-clip bg-secondary/60 py-24 dark:bg-secondary/30 sm:py-28">
      <div className="absolute inset-0 bg-grid-soft [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />
      <div className="container relative">
        <SectionHeading eyebrow="Success stories" title="Trusted by traders, students and staff" />
        <div
          className="mx-auto mt-14 max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative min-h-[260px] rounded-3xl border bg-card p-8 shadow-xl shadow-forest-900/5 sm:p-12">
            <Quote className="absolute -top-5 left-8 h-10 w-10 rounded-xl bg-gold-500 p-2 text-forest-950 shadow-lg" />
            <AnimatePresence mode="wait">
              <motion.figure
                key={index}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <blockquote className="font-serif text-xl leading-relaxed sm:text-2xl">“{t.quote}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-gold-300 dark:bg-forest-700">
                    {t.name.replace(/^(Mrs?\.|Dr\.)\s*/, "").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Previous testimonial">
              <ChevronLeft />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={cn("h-2 rounded-full transition-all duration-300", i === index ? "w-8 bg-gold-500" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50")}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Next testimonial">
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CallToAction() {
  return (
    <section className="py-24 sm:py-28">
      <div className="container">
        <Reveal>
          <div className="relative overflow-clip rounded-[2rem] bg-forest-900 px-6 py-16 text-center text-white sm:px-16">
            <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
            <motion.div
              className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold-500/25 blur-3xl"
              animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance font-serif text-3xl font-semibold sm:text-5xl">Summer 2027 registration is open</h2>
              <p className="mt-5 text-lg text-white/70">
                Seats are limited and allocated on a first-come basis. Secure your place in a Summer Computer Programme today.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="gold" className="group">
                  <Link href="/programmes?category=SUMMER">
                    View summer courses <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline-light">
                  <Link href="/contact">Talk to us</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
