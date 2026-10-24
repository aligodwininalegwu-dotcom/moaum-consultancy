/**
 * Used by template.tsx files: every navigation re-mounts this wrapper, which
 * replays the entrance. It is a CSS animation (not Framer Motion) so pages are
 * visible immediately, even before JavaScript has loaded on slow connections.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 ease-out">{children}</div>;
}
