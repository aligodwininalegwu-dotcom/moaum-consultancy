"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, GraduationCap, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/data/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const orbY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-clip bg-forest-950 text-white">
      {/* Parallax background layers */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,#136650_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_10%_90%,#0A4D3C_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </motion.div>
      <motion.div style={{ y: orbY }} className="absolute inset-0 -z-10" aria-hidden>
        <motion.div
          className="absolute right-[8%] top-[18%] h-[420px] w-[420px] rounded-full bg-gold-500/20 blur-[110px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] left-[5%] h-[360px] w-[360px] rounded-full bg-forest-400/25 blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Concentric rings echoing a seal */}
        <svg className="absolute -right-40 top-1/2 h-[900px] w-[900px] -translate-y-1/2 opacity-[0.08]" viewBox="0 0 400 400">
          {[60, 100, 140, 180].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#C9A227" strokeWidth="0.8" strokeDasharray={r === 140 ? "3 6" : undefined} />
          ))}
        </svg>
      </motion.div>

      <motion.div style={{ y: contentY, opacity: fade }} className="container relative flex min-h-[100svh] flex-col justify-center pb-24 pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p
              className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" /> Consultancy Unit · Makurdi
            </p>

            <h1 className="animate-in fade-in slide-in-from-bottom-5 fill-mode-both delay-100 duration-700 mt-7 text-balance font-serif text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl lg:text-[4.25rem]"
            >
              Where University knowledge meets <span className="text-gradient-gold">enterprise</span>.
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-5 fill-mode-both delay-200 duration-700 mt-6 max-w-xl text-lg leading-relaxed text-white/70"
            >
              Apply for a campus shop, register for e-learning and summer computer programmes, and access professional
              consultancy services from {site.university}, all in one place.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-5 fill-mode-both delay-300 duration-700 mt-10 flex flex-col gap-3 sm:flex-row"
            >
              <Button asChild size="lg" variant="gold" className="group">
                <Link href="/shops">
                  Apply for a shop <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline-light">
                <Link href="/programmes">Explore programmes</Link>
              </Button>
            </div>

            <ul className="animate-in fade-in fill-mode-both delay-500 duration-1000 mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60"
            >
              {["Transparent allocation", "Online status tracking", "Certified programmes"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold-400" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Floating preview cards */}
          <div className="relative hidden h-[460px] lg:block">
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.9, delay: 0.3, ease }}
              className="absolute left-0 top-6 w-72"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/20 text-gold-300">
                    <Store className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Shop WC-A01</p>
                    <p className="text-xs text-white/55">Western Campus · 18 m²</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-xs">
                  {(
                    [
                      ["Submitted", true],
                      ["Under review", true],
                      ["Allocated", false],
                    ] as const
                  ).map(([label, done], i) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span className={`h-2 w-2 rounded-full ${done ? "bg-gold-400" : "bg-white/25"}`} />
                      <span className={done ? "text-white/85" : "text-white/45"}>{label}</span>
                      {i === 1 && <span className="ml-auto rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] text-sky-300">In progress</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 3 }}
              animate={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.9, delay: 0.45, ease }}
              className="absolute bottom-4 right-0 w-80"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-2xl border border-white/15 bg-white p-5 text-forest-950 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-700 text-gold-300">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-800">
                    Summer 2027
                  </span>
                </div>
                <p className="mt-4 font-serif text-lg font-semibold">Website Design &amp; Development</p>
                <p className="mt-1 text-xs text-forest-950/60">6 weeks · On-campus · ICT Centre</p>
                <div className="mt-4 h-1.5 overflow-clip rounded-full bg-forest-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-forest-600 to-gold-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "72%" }}
                    transition={{ duration: 1.6, delay: 1, ease }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-forest-950/55">29 of 40 seats taken</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease }}
              className="absolute right-12 top-0 rounded-2xl border border-white/10 bg-forest-800/80 px-5 py-4 backdrop-blur"
            >
              <p className="font-serif text-3xl font-semibold text-gold-300">2,400+</p>
              <p className="text-xs text-white/60">learners trained</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        aria-hidden
      >
        <div className="flex h-10 w-6 justify-center rounded-full border border-white/25 pt-2">
          <motion.span
            className="h-2 w-1 rounded-full bg-gold-400"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
