import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Official university crest (from bsum.edu.ng), on a white disc so its black
 * gear and motto ribbon stay visible on the site's dark green surfaces.
 * Pass `alt` when the crest carries meaning on its own; it's decorative
 * (empty alt) when it sits next to the university's name.
 */
export function Crest({ className, alt = "", priority = false }: { className?: string; alt?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/moaum-logo-badge.png"
      alt={alt}
      width={256}
      height={256}
      priority={priority}
      className={cn("h-10 w-auto rounded-full shadow-sm ring-1 ring-black/5", className)}
    />
  );
}

export function Logo({ light = false, compact = false, className }: { light?: boolean; compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label="MOAUM Consultancy home">
      <Crest priority className="h-11 transition-transform duration-300 group-hover:scale-105" />
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
