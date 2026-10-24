import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, CalendarDays, CheckCircle2, Clock, GraduationCap, MapPin, Users, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { RegistrationForm } from "@/components/programmes/registration-form";
import { PROGRAMME_CATEGORY_LABEL, type ProgrammeCategory } from "@/lib/constants";
import { formatDate, formatNaira, parseModules } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.programme.findUnique({ where: { slug } });
  return p ? { title: p.title, description: p.summary } : { title: "Programme not found" };
}

export const dynamic = "force-dynamic";

export default async function ProgrammePage({ params }: Props) {
  const { slug } = await params;
  const programme = await prisma.programme.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: { where: { status: { not: "REJECTED" } } } } } },
  });
  if (!programme || !programme.active) notFound();

  const session = await getSession();
  const [user, existing] = session?.user
    ? await Promise.all([
        prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true } }),
        prisma.registration.findUnique({
          where: { userId_programmeId: { userId: session.user.id, programmeId: programme.id } },
          select: { reference: true, status: true },
        }),
      ])
    : [null, null];

  const modules = parseModules(programme.modules);
  const seatsLeft = Math.max(programme.seats - programme._count.registrations, 0);
  const facts = [
    { icon: Clock, label: "Duration", value: programme.duration },
    { icon: MapPin, label: "Mode", value: programme.mode },
    { icon: CalendarDays, label: "Starts", value: formatDate(programme.startDate, { month: "long" }) },
    { icon: GraduationCap, label: "Level", value: programme.level },
    { icon: Users, label: "Seats left", value: `${seatsLeft} of ${programme.seats}` },
    { icon: Wallet, label: "Fee", value: formatNaira(programme.fee) },
  ];

  return (
    <>
      <PageHero
        eyebrow={PROGRAMME_CATEGORY_LABEL[programme.category as ProgrammeCategory]}
        title={programme.title}
        description={programme.summary}
        crumbs={[
          { href: "/programmes", label: "Programmes" },
          { href: `/programmes/${programme.slug}`, label: programme.title },
        ]}
      />

      <section className="py-16 sm:py-20">
        <div className="container grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {facts.map((f) => (
                <StaggerItem key={f.label}>
                  <div className="rounded-2xl border bg-card p-5">
                    <f.icon className="h-5 w-5 text-gold-600" />
                    <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{f.label}</p>
                    <p className="mt-0.5 font-semibold">{f.value}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal className="mt-12">
              <h2 className="font-serif text-2xl font-semibold">About this programme</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{programme.description}</p>
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="font-serif text-2xl font-semibold">What you will learn</h2>
              <ol className="mt-6 space-y-3">
                {modules.map((m, i) => (
                  <li key={m} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-gold-500/40">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-serif text-sm font-semibold text-gold-300 dark:bg-forest-700">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium">{m}</span>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="mt-12 flex gap-4 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-6">
              <Award className="h-8 w-8 shrink-0 text-gold-600" />
              <div>
                <h3 className="font-semibold">Certificate of Completion</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Awarded by the Consultancy Unit to participants with at least 75% attendance who pass the final assessment.
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  {["Hands-on projects", "Experienced facilitators", "Learning materials included"].map((t) => (
                    <li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-forest-500" /> {t}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <RegistrationForm
              programme={{ id: programme.id, title: programme.title, fee: programme.fee, slug: programme.slug }}
              signedIn={!!session?.user}
              defaultPhone={user?.phone ?? ""}
              existing={existing}
              full={seatsLeft === 0}
            />
          </div>
        </div>
      </section>
    </>
  );
}
