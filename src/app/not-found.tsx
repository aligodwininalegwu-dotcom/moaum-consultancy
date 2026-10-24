import Link from "next/link";
import { Crest } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-clip bg-forest-950 px-4 text-center text-white">
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div className="relative">
        <Crest alt="Crest of Rev. Fr. Moses Orshio Adasu University, Makurdi" className="mx-auto h-20" />
        <p className="mt-8 font-serif text-7xl font-semibold text-gold-300">404</p>
        <h1 className="mt-3 font-serif text-2xl font-semibold">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-white/65">The page you are looking for has moved or does not exist.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="gold"><Link href="/">Back to home</Link></Button>
          <Button asChild variant="outline-light"><Link href="/contact">Contact us</Link></Button>
        </div>
      </div>
    </main>
  );
}
