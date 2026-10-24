"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input, NativeSelect } from "@/components/ui/input";

/** URL-driven filters (search + selects) for admin tables. */
export function FilterBar({ selects }: { selects: { name: string; label: string; options: { value: string; label: string }[] }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  React.useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) update("q", q);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or reference…" className="pl-10" aria-label="Search" />
      </div>
      {selects.map((s) => (
        <div key={s.name} className="sm:w-52">
          <NativeSelect aria-label={s.label} value={params.get(s.name) ?? ""} onChange={(e) => update(s.name, e.target.value)}>
            <option value="">{s.label}: all</option>
            {s.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </NativeSelect>
        </div>
      ))}
    </div>
  );
}
