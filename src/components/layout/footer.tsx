import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { site } from "@/data/site";
import { Logo } from "@/components/layout/logo";

const columns = [
  {
    title: "Services",
    links: [
      { href: "/shops", label: "Shop Allocation" },
      { href: "/programmes?category=ELEARNING", label: "E-Learning" },
      { href: "/programmes?category=SUMMER", label: "Summer Programmes" },
      { href: "/services#other-services", label: "Consultancy Services" },
    ],
  },
  {
    title: "Applicants",
    links: [
      { href: "/register", label: "Create an account" },
      { href: "/dashboard", label: "My dashboard" },
      { href: "/shops#track", label: "Track an application" },
      { href: "/shops#guidelines", label: "Allocation guidelines" },
    ],
  },
  {
    title: "The Unit",
    links: [
      { href: "/about", label: "About us" },
      { href: "/about#leadership", label: "Leadership" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-clip bg-forest-950 text-white">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
      <div className="container relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-5">
            <Logo light />
            <p className="max-w-sm text-sm leading-relaxed text-white/65">{site.description}</p>
            <p className="font-serif text-sm italic text-gold-300">
              “{site.motto}” <span className="not-italic text-white/50">— {site.mottoEnglish}</span>
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-4">
          <p className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-gold-400" /> Main Campus, Makurdi, Benue State</p>
          <p className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-gold-400" /> {site.contact.email}</p>
          <p className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-gold-400" /> {site.contact.phone}</p>
          <p className="flex gap-3"><Clock className="h-4 w-4 shrink-0 text-gold-400" /> {site.contact.hours}</p>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Consultancy Unit, {site.university}. All rights reserved.</p>
          <p>{site.formerly.replace(/^f/, "F")}</p>
        </div>
      </div>
    </footer>
  );
}
