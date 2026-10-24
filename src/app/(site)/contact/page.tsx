import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/data/site";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Consultancy Unit, Rev. Fr. Moses Orshio Adasu University, Makurdi.",
};

export default function ContactPage() {
  const details = [
    { icon: MapPin, label: "Office", value: site.contact.address },
    { icon: Mail, label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: Phone, label: "Phone", value: `${site.contact.phone} · ${site.contact.phoneAlt}`, href: `tel:${site.contact.phone.replace(/\s/g, "")}` },
    { icon: Clock, label: "Office hours", value: site.contact.hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We'd like to hear from you"
        description="Questions about shop allocation, programmes or consultancy services? Send us a message and the right officer will respond."
        crumbs={[{ href: "/contact", label: "Contact" }]}
      />
      <section className="py-20">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-4">
            {details.map((d, i) => (
              <Reveal key={d.label} delay={i * 0.06}>
                <div className="flex gap-4 rounded-2xl border bg-card p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-gold-300 dark:bg-forest-700"><d.icon className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d.label}</p>
                    {d.href ? (
                      <a href={d.href} className="mt-1 block text-sm font-medium hover:text-primary">{d.value}</a>
                    ) : (
                      <p className="mt-1 text-sm font-medium">{d.value}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              {/* Map placeholder: swap for a Google Maps / OpenStreetMap embed when keys are available. */}
              <div className="relative h-64 overflow-clip rounded-2xl border bg-forest-900">
                <div className="absolute inset-0 bg-grid opacity-60" />
                <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden>
                  <path d="M0 180 C80 160 120 200 200 170 S320 120 400 140" stroke="#C9A227" strokeWidth="3" fill="none" />
                  <path d="M140 0 C150 80 130 160 170 260" stroke="#6dbea3" strokeWidth="2" fill="none" />
                  <path d="M0 90 L400 70" stroke="#6dbea3" strokeWidth="1.5" fill="none" strokeDasharray="6 6" />
                </svg>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                  <span className="relative flex h-12 w-12 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-40" />
                    <MapPin className="relative h-10 w-10 fill-gold-500 text-forest-950" />
                  </span>
                </div>
                <p className="absolute bottom-4 left-4 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur">
                  Main Campus, Makurdi · Benue State
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
