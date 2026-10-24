import Link from "next/link";
import { cn } from "@/lib/utils";

/** Stylised crest mark: shield + open book + rising sun. */
export function Crest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={cn("h-10 w-auto", className)} aria-hidden="true">
      <defs>
        <linearGradient id="crest-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0C056" />
          <stop offset="100%" stopColor="#A7811C" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 L45 9 V27 C45 40 36 49 24 54 C12 49 3 40 3 27 V9 Z"
        fill="#0A4D3C"
        stroke="url(#crest-gold)"
        strokeWidth="2.5"
      />
      <circle cx="24" cy="22" r="6" fill="url(#crest-gold)" />
      <g stroke="url(#crest-gold)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M24 11v3M15.5 14.5l2 2M32.5 14.5l-2 2M12 22h3M33 22h3" />
      </g>
      <path d="M11 31 C17 29 21 30 24 33 C27 30 31 29 37 31 V42 C31 40 27 41 24 44 C21 41 17 40 11 42 Z" fill="#F7F3E3" />
      <path d="M24 33 V44" stroke="#0A4D3C" strokeWidth="1.4" />
    </svg>
  );
}

export function Logo({ light = false, compact = false, className }: { light?: boolean; compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label="MOAUM Consultancy home">
      <Crest className="h-10 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-serif text-lg font-semibold tracking-tight", light ? "text-white" : "text-foreground")}>
          MOAUM <span className="text-gold-500">Consultancy</span>
        </span>
        <span className={cn("mt-1 hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.18em] sm:block", light ? "text-white/60" : "text-muted-foreground")}>
          {compact ? "Rev. Fr. M. O. Adasu Univ." : "Rev. Fr. Moses Orshio Adasu University"}
        </span>
      </span>
    </Link>
  );
}
