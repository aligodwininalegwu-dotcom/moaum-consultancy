import { CheckCircle2 } from "lucide-react";
import { Crest } from "@/components/layout/logo";
import { site } from "@/data/site";

/** Two-column layout for sign-in / sign-up: brand panel + form card. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="relative min-h-screen overflow-clip bg-forest-950 pb-16 pt-28">
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-forest-500/25 blur-3xl" aria-hidden />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gold-500/15 blur-3xl" aria-hidden />
      <div className="container relative grid items-center gap-12 lg:grid-cols-2">
        <div className="hidden text-white lg:block">
          <Crest alt="Crest of Rev. Fr. Moses Orshio Adasu University, Makurdi" className="h-20 ring-4 ring-white/10" />
          <h2 className="mt-8 max-w-md font-serif text-4xl font-semibold leading-tight">One account for every Consultancy Unit service.</h2>
          <ul className="mt-8 space-y-3 text-white/75">
            {["Apply for shops on both campuses", "Register for e-learning and summer programmes", "Track every application in real time", "Download official letters as PDF"].map((t) => (
              <li key={t} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-gold-400" /> {t}</li>
            ))}
          </ul>
          <p className="mt-12 font-serif italic text-gold-300">“{site.motto}”</p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-background p-7 shadow-2xl sm:p-9">
          <h1 className="font-serif text-3xl font-semibold">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </section>
  );
}
